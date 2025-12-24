from datetime import datetime
from pydantic import BaseModel
from typing import Any, List, Optional


class Testcase(BaseModel):
    sysin: Any
    expected: Any


class ProblemSummary(BaseModel):
    problemId: int
    title: str
    defaultLanguage: str = "python3"
    isSolved: bool = False
    submissionCount: int = 0
    lastSubmittedAt: Optional[datetime] = None


class ProblemDetail(BaseModel):
    problemId: int
    quizSetId: int
    orderIndex: int
    title: str
    defaultLanguage: str
    statement: str
    sysinFormat: str
    starterCode: Optional[str] = None
    sampleAnswer: Optional[str] = None
    testcases: List[Testcase]
