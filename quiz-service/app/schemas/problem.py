from typing import Any, List, Optional

from pydantic import BaseModel


class Testcase(BaseModel):
    sysin: Any
    expected: Any


class ProblemCreate(BaseModel):
    title: str
    category: str = "syntax"
    statement: str
    sysinFormat: str
    defaultLanguage: str = "python3"
    sampleAnswer: Optional[str] = None
    testcases: List[Testcase]


class ProblemSummary(BaseModel):
    problemId: int
    title: str
    defaultLanguage: str


class ProblemDetail(BaseModel):
    problemId: int
    quizSetId: int
    orderIndex: int
    title: str
    defaultLanguage: str
    statement: str
    sysinFormat: str
    sampleAnswer: Optional[str] = None
    testcases: List[Testcase]


class ProblemLanguageItem(BaseModel):
    problemId: int
    defaultLanguage: str
