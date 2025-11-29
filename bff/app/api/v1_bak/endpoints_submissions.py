from fastapi import APIRouter, HTTPException
from app.schemas.submissions import ExecuteRequest, ExecuteResponse, SubmissionRequest, SubmissionResponse
from app.clients.executor_client import ExecutorClient
from app.clients.validator_client import ValidatorClient
from app.clients.progress_client import ProgressClient

router = APIRouter()
executor_client = ExecutorClient()
validator_client = ValidatorClient()
progress_client = ProgressClient()

@router.post("/runner/execute", response_model=ExecuteResponse)
async def execute_code(data: ExecuteRequest):
    try:
        # 単純な実行
        response = await executor_client.execute_code(data.model_dump())
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submissions", response_model=SubmissionResponse)
async def submit_solution(data: SubmissionRequest):
    try:
        # 1. 採点 (Validator Service)
        validation_result = await validator_client.validate_submission(data.model_dump())
        
        # validation_result structure expected:
        # { "isCorrect": true, "message": "Correct", "executionResult": {...} }
        
        # 2. 結果保存 (Progress Service)
        # Progress Serviceへの保存フォーマットに合わせる
        save_payload = {
            "userId": data.userId,
            "problemId": data.problemId,
            "isCorrect": validation_result.get("isCorrect", False),
            "submittedCode": data.submittedCode
        }
        
        # エラーハンドリング: 保存に失敗しても採点結果は返すべきか？ -> Yes, but log error.
        # ここではシンプルに例外が出たら500にする
        await progress_client.save_submission(save_payload)
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
