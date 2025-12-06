from fastapi import APIRouter, status
from app.schemas.quiz_creation import (
    GenerateQuizRequest,
    GenerateQuizResponse,
)

router = APIRouter()


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest):
    return GenerateQuizResponse(
        quizSetId=205,
    )
