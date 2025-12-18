from typing import Any, List, Optional

from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    """POST /api/v1/runner/execute リクエスト"""
    problemId: int
    language: str
    code: str
    testcaseIndex: int


class ExecuteResponse(BaseModel):
    """POST /api/v1/runner/execute レスポンス"""
    stdout: str
    stderr: str
    exitCode: int


class SubmissionRequest(BaseModel):
    """POST /api/v1/submissions リクエスト"""
    problemId: int
    language: str
    code: str


class SubmissionDetailItem(BaseModel):
    """各 testcase の判定結果詳細"""
    testcaseIndex: int
    sysin: Any
    expected: Any
    stdout: str
    stderr: str
    exitCode: int
    passed: bool


class SubmissionResponse(BaseModel):
    """POST /api/v1/submissions レスポンス"""
    isCorrect: bool
    message: str
    details: List[SubmissionDetailItem]
