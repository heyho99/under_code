from fastapi import APIRouter, status
from app.schemas.quiz_creation import (
    SourceUploadRequest,
    SourceUploadResponse,
    GenerateQuizRequest,
    GenerateQuizResponse,
)

router = APIRouter()


@router.post("/upload", response_model=SourceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_source(data: SourceUploadRequest):
    return SourceUploadResponse(
        sourceId=5001,
        message="Mock upload successful",
    )


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest):
    return GenerateQuizResponse(
        quizSetId=205,
    )
