import logging

from fastapi import APIRouter, HTTPException, status

from app.clients.llm_client import LLMError
from app.schemas.generator import GenerateRequest, GenerateResponse
from app.services.generator import generate
from app.services.structured_markdown_parser import StructuredMarkdownParseError


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/generator/health", tags=["generator"])
async def generator_health() -> dict:
    return {"status": "ok"}


@router.post("/generator/generate", response_model=GenerateResponse, tags=["generator"])
async def generate_endpoint(payload: GenerateRequest) -> GenerateResponse:
    try:
        return await generate(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except StructuredMarkdownParseError as exc:
        logger.exception("Failed to parse structured Markdown")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except LLMError as exc:
        logger.exception("LLM call failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to generate problems")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate problems",
        ) from exc
