from typing import List, Optional

from pydantic import BaseModel

from app.schemas.problem import ProblemCreate, ProblemSummary


class QuizSetGenerateRequest(BaseModel):
    userId: int
    title: str
    description: Optional[str] = None
    problems: List[ProblemCreate]


class QuizSetGenerateResponse(BaseModel):
    quizSetId: int
    totalProblems: int


class QuizSetSummary(BaseModel):
    quizSetId: int
    title: str
    description: Optional[str] = None


class QuizSetDetail(BaseModel):
    quizSetId: int
    title: str
    description: Optional[str] = None
    problems: List[ProblemSummary]

