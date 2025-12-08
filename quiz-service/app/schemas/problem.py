from typing import Optional

from pydantic import BaseModel


class ProblemCreate(BaseModel):
    title: str
    description: str
    contentMarkdown: str
    sampleAnswer: Optional[str] = None


class ProblemSummary(BaseModel):
    problemId: int
    title: str
    description: str


class ProblemDetail(BaseModel):
    problemId: int
    quizSetId: int
    orderIndex: int
    title: str
    description: str
    contentMarkdown: str
    sampleAnswer: Optional[str] = None

