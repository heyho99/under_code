from fastapi import APIRouter
from app.schemas.submissions import (
    ExecuteRequest,
    ExecuteResponse,
    SubmissionRequest,
    SubmissionResponse,
)

router = APIRouter()


@router.post("/runner/execute", response_model=ExecuteResponse)
async def execute_code(data: ExecuteRequest):
    return ExecuteResponse(
        stdout="Mock execution output\n",
        stderr="",
        exitCode=0,
    )


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
