from typing import Any, Dict, List

import ast
import logging
from fastapi import APIRouter, HTTPException, status

from app.clients.generator_client import GeneratorClient
from app.clients.quiz_client import QuizClient
from app.schemas.quiz_creation import (
    GenerateQuizRequest,
    GenerateQuizResponse,
)


router = APIRouter()
logger = logging.getLogger(__name__)
generator_client = GeneratorClient()
quiz_client = QuizClient()


def _from_repr_or_raw(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    try:
        return ast.literal_eval(value)
    except Exception:
        return value


def _convert_quizzes_to_problems(quizzes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    problems: List[Dict[str, Any]] = []
    for quiz in quizzes:
        raw_title = quiz.get("title")
        raw_description = quiz.get("description")
        raw_sysin_format = quiz.get("sysin_format")
        raw_sample_code = quiz.get("sample_code")

        title = _from_repr_or_raw(raw_title) or ""
        description = _from_repr_or_raw(raw_description) or ""
        sysin_format = _from_repr_or_raw(raw_sysin_format) or ""
        sample_code = _from_repr_or_raw(raw_sample_code) or ""

        parts: List[str] = []
        if description:
            parts.append(str(description))
        if sysin_format:
            parts.append("\n\n[Input Format]\n")
            parts.append(str(sysin_format))

        content_markdown = "".join(parts) if parts else ""

        problems.append(
            {
                "title": str(title),
                "description": str(description),
                "contentMarkdown": content_markdown,
                "sampleAnswer": str(sample_code) if sample_code is not None else None,
            }
        )

    return problems


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest) -> GenerateQuizResponse:
    try:
        generator_payload = data.model_dump()
        generator_response = await generator_client.generate_problems(generator_payload)
        quizzes = generator_response.get("quizzes")
        if not isinstance(quizzes, list) or not quizzes:
            raise HTTPException(status_code=502, detail="Invalid response from generator service")

        problems = _convert_quizzes_to_problems(quizzes)

        save_payload: Dict[str, Any] = {
            "userId": data.userId,
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
