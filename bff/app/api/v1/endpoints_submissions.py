import logging

from fastapi import APIRouter, HTTPException

from app.clients.executor_client import ExecutorClient
from app.schemas.submissions import (
    ExecuteRequest,
    ExecuteResponse,
    SubmissionRequest,
    SubmissionResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)
executor_client = ExecutorClient()


@router.post("/runner/execute", response_model=ExecuteResponse)
async def execute_code(data: ExecuteRequest):
    try:
        payload = data.model_dump()
        result = await executor_client.execute_code(payload)
        return ExecuteResponse(**result)
    except Exception:
        logger.exception("Failed to execute code via executor service")
        raise HTTPException(status_code=502, detail="Failed to execute code")


@router.post("/submissions", response_model=SubmissionResponse)
async def submit_solution(data: SubmissionRequest):
    execution_result = ExecuteResponse(
        stdout="Mock execution output\n",
        stderr="",
        exitCode=0,
    )
    return SubmissionResponse(
        isCorrect=True,
        message="Mock submission accepted",
        executionResult=execution_result,
    )
