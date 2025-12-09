from fastapi import APIRouter

from app.schemas.execute import ExecuteRequest, ExecuteResponse
from app.services import executor_service


router = APIRouter()


@router.post("/executor/execute", response_model=ExecuteResponse)
async def execute_code(payload: ExecuteRequest) -> ExecuteResponse:
    return await executor_service.execute_code(payload)
