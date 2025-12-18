from typing import Any, Dict, List

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.clients.generator_client import GeneratorClient
from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id
from app.schemas.quiz_creation import (
    GenerateQuizRequest,
    GenerateQuizResponse,
)


router = APIRouter()
logger = logging.getLogger(__name__)
generator_client = GeneratorClient()
quiz_client = QuizClient()


def _convert_generator_problems(problems_from_generator: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generator Service のレスポンスを Quiz Service 保存用に変換する"""
    problems: List[Dict[str, Any]] = []
    for p in problems_from_generator:
        problems.append(
            {
                "title": p.get("title", ""),
                "category": p.get("category", "syntax"),
                "statement": p.get("statement", ""),
                "sysinFormat": p.get("sysinFormat", ""),
                "defaultLanguage": p.get("defaultLanguage", "python3"),
                "sampleAnswer": p.get("sampleAnswer"),
                "testcases": p.get("testcases", []),
            }
        )
    return problems


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest, user_id: int = Depends(get_current_user_id)) -> GenerateQuizResponse:
    try:
        generator_payload = data.model_dump()
        generator_response = await generator_client.generate_problems(generator_payload)
        problems_from_generator = generator_response.get("problems")
        if not isinstance(problems_from_generator, list) or not problems_from_generator:
            raise HTTPException(status_code=502, detail="Invalid response from generator service")

        problems = _convert_generator_problems(problems_from_generator)

        save_payload: Dict[str, Any] = {
            "userId": user_id,
            "title": data.title,
            "description": data.description,
            "problems": problems,
        }

        save_response = await quiz_client.create_quiz_set(save_payload)
        quiz_set_id = save_response.get("quizSetId")
        total_problems = save_response.get("totalProblems")

        if quiz_set_id is None:
            raise HTTPException(status_code=502, detail="Invalid response from quiz service")

        if not isinstance(total_problems, int):
            total_problems = len(problems)

        return GenerateQuizResponse(quizSetId=quiz_set_id, totalProblems=total_problems)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to generate quiz set")
        raise HTTPException(status_code=500, detail="Failed to generate quiz set")
