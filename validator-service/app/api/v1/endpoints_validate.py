from fastapi import APIRouter

from app.schemas.validate import ValidateRequest, ValidateResponse
from app.services.validator_service import judge_all

router = APIRouter()


@router.post("/validator/validate", response_model=ValidateResponse)
async def validate_submission(request: ValidateRequest) -> ValidateResponse:
    """
    提出されたコードの実行結果を判定する。
    - 各 testcase の stdout 最終非空行を JSON パースし、expected と比較
    - 全ケース合格なら isCorrect=True
    """
    return judge_all(request.cases)
