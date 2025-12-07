from fastapi import APIRouter

from app.schemas.generator import GenerateRequest, GenerateResponse
from app.services.generator import generate_quiz_set


router = APIRouter()


@router.get("/generator/health", tags=["generator"])
async def generator_health() -> dict:
    return {"status": "ok"}


@router.post("/generate", response_model=GenerateResponse, tags=["generator"])
async def generate_quiz_endpoint(payload: GenerateRequest) -> GenerateResponse:
    """Generate quizzes from source files using the LLM.

    This endpoint mirrors the PoC flow (llm_creator + extract_quizzes) but returns JSON directly
    without writing any files.
    """

    return await generate_quiz_set(payload)
