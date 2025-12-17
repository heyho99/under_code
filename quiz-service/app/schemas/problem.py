from typing import Any, List, Optional

from pydantic import BaseModel


class Testcase(BaseModel):
    sysin: Any
    expected: Any


class ProblemCreate(BaseModel):
    title: str
    description: str = ""
    contentMarkdown: str
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
    contentMarkdown: str
    sysinFormat: str
    sampleAnswer: Optional[str] = None
    testcases: List[Testcase]
