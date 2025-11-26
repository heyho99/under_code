from pydantic import BaseModel
from typing import Optional

class ProblemSummary(BaseModel):
    problemId: int
    title: str
    description: Optional[str] = ""
    isSolved: bool = False

class ProblemDetail(BaseModel):
    problemId: int
    quizSetId: int
    orderIndex: int
    title: str
    description: str
    contentMarkdown: str
    sampleAnswer: Optional[str] = None
