from fastapi import APIRouter


router = APIRouter()


@router.get("/generator/health", tags=["generator"])
async def generator_health() -> dict:
    return {"status": "ok"}
