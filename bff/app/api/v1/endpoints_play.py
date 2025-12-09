import logging

from fastapi import APIRouter, HTTPException

from app.clients.quiz_client import QuizClient
from app.schemas.problems import ProblemDetail

router = APIRouter()
logger = logging.getLogger(__name__)
quiz_client = QuizClient()


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int):
    try:
        data = await quiz_client.get_problem(problem_id)
    except Exception:
        logger.exception("Failed to fetch problem detail")
        raise HTTPException(status_code=502, detail="Failed to fetch problem detail")

    return ProblemDetail(**data)
