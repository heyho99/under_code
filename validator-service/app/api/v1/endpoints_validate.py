from fastapi import APIRouter


router = APIRouter()


@router.post("/validator/validate")
async def validate_submission():
    return {"isCorrect": False, "message": "not implemented", "executionResult": None}
