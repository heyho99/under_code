import json
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.clients.executor_client import ExecutorClient
from app.clients.progress_client import ProgressClient
from app.clients.quiz_client import QuizClient
from app.clients.validator_client import ValidatorClient
from app.core.security import get_current_user_id
from app.schemas.submissions import (
    ExecuteRequest,
    ExecuteResponse,
    SubmissionDetailItem,
    SubmissionRequest,
    SubmissionResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)
executor_client = ExecutorClient()
progress_client = ProgressClient()
quiz_client = QuizClient()
validator_client = ValidatorClient()


@router.post("/runner/execute", response_model=ExecuteResponse)
async def execute_code(data: ExecuteRequest, user_id: int = Depends(get_current_user_id)):
    """
    特定の testcase でコードを1回実行する。
    1. Quiz Service から testcases を取得
    2. testcases[testcaseIndex].sysin を JSON 文字列化して stdin とする
    3. Executor Service に { language, code, stdin } で実行依頼
    """
    try:
        problem_data = await quiz_client.get_problem(data.problemId)
        testcases = problem_data.get("testcases", [])

        if data.testcaseIndex < 0 or data.testcaseIndex >= len(testcases):
            raise HTTPException(status_code=400, detail="Invalid testcaseIndex")

        sysin = testcases[data.testcaseIndex].get("sysin")
        stdin = json.dumps(sysin)

        executor_payload = {
            "language": data.language,
            "code": data.code,
            "stdin": stdin,
        }
        result = await executor_client.execute_code(executor_payload)
        return ExecuteResponse(
            stdout=result.get("stdout", ""),
            stderr=result.get("stderr", ""),
            exitCode=result.get("exitCode", 1),
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to execute code via executor service")
        raise HTTPException(status_code=502, detail="Failed to execute code")


@router.post("/submissions", response_model=SubmissionResponse)
async def submit_solution(data: SubmissionRequest, user_id: int = Depends(get_current_user_id)):
    """
    全 testcase を実行して採点する。
    1. Quiz Service から testcases を取得
    2. 各 testcase について stdin=json.dumps(sysin) を作り Executor Service で実行
    3. 実行結果と expected を Validator Service に渡して判定
    4. Progress Service に結果を保存
    5. 結果を返す
    """
    try:
        problem_data = await quiz_client.get_problem(data.problemId)
        testcases = problem_data.get("testcases", [])

        if not testcases:
            raise HTTPException(status_code=400, detail="No testcases found for this problem")

        execution_results = []
        for idx, tc in enumerate(testcases):
            sysin = tc.get("sysin")
            stdin = json.dumps(sysin)

            executor_payload = {
                "language": data.language,
                "code": data.code,
                "stdin": stdin,
            }
            exec_result = await executor_client.execute_code(executor_payload)
            execution_results.append({
                "testcaseIndex": idx,
                "sysin": sysin,
                "expected": tc.get("expected"),
                "stdout": exec_result.get("stdout", ""),
                "stderr": exec_result.get("stderr", ""),
                "exitCode": exec_result.get("exitCode", 1),
            })

        validator_cases = [
            {
                "testcaseIndex": er["testcaseIndex"],
                "expected": er["expected"],
                "stdout": er["stdout"],
                "stderr": er["stderr"],
                "exitCode": er["exitCode"],
            }
            for er in execution_results
        ]
        validator_response = await validator_client.validate_submission({"cases": validator_cases})

        is_correct = validator_response.get("isCorrect", False)
        message = validator_response.get("message", "")
        validator_details = validator_response.get("details", [])

        passed_map = {d["testcaseIndex"]: d.get("passed", False) for d in validator_details}

        details = [
            SubmissionDetailItem(
                testcaseIndex=er["testcaseIndex"],
                sysin=er["sysin"],
                expected=er["expected"],
                stdout=er["stdout"],
                stderr=er["stderr"],
                exitCode=er["exitCode"],
                passed=passed_map.get(er["testcaseIndex"], False),
            )
            for er in execution_results
        ]

        try:
            await progress_client.save_submission({
                "userId": user_id,
                "problemId": data.problemId,
                "isCorrect": is_correct,
                "language": data.language,
            })
        except Exception:
            logger.warning("Failed to save submission to progress service", exc_info=True)

        return SubmissionResponse(
            isCorrect=is_correct,
            message=message,
            details=details,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to submit solution")
        raise HTTPException(status_code=502, detail="Failed to submit solution")
