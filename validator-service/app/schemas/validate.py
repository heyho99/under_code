from typing import Any, List

from pydantic import BaseModel


class ValidateCase(BaseModel):
    """1つのテストケースの判定入力"""
    testcaseIndex: int
    expected: Any
    stdout: str
    stderr: str
    exitCode: int


class ValidateRequest(BaseModel):
    """POST /validator/validate リクエスト"""
    cases: List[ValidateCase]


class ValidateDetail(BaseModel):
    """1つのテストケースの判定結果"""
    testcaseIndex: int
    passed: bool
    reason: str = ""
    parsedOutput: Any = None


class ValidateResponse(BaseModel):
    """POST /validator/validate レスポンス"""
    isCorrect: bool
    message: str
    details: List[ValidateDetail]
