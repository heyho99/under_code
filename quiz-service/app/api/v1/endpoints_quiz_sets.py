from typing import List

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.quiz_set import (
    QuizSetGenerateRequest,
    QuizSetGenerateResponse,
    QuizSetSummary,
    QuizSetDetail,
)
from app.services import quiz_set_service


router = APIRouter()


@router.post(
    "/quiz/quiz-sets/generate",
    response_model=QuizSetGenerateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_quiz_set(payload: QuizSetGenerateRequest) -> QuizSetGenerateResponse:
    return await quiz_set_service.create_quiz_set_from_generated(payload)


@router.get("/quiz/quiz-sets", response_model=List[QuizSetSummary])
async def list_quiz_sets(userId: int = Query(..., description="User ID")) -> List[QuizSetSummary]:
    return await quiz_set_service.list_quiz_sets(userId)


@router.get("/quiz/quiz-sets/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set_detail(quiz_set_id: int) -> QuizSetDetail:
    detail = await quiz_set_service.get_quiz_set_detail(quiz_set_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz set not found")
    return detail
