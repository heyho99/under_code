from pydantic import BaseModel
from typing import Dict, List, Optional
from .problems import ProblemSummary

class QuizSetSummary(BaseModel):
    quizSetId: int
    title: str
    description: Optional[str] = ""
    total: int = 0
    completed: int = 0
    progressRate: float = 0.0
    languageCounts: Dict[str, int] = {}

class QuizSetDetail(BaseModel):
    quizSetId: int
    title: str
    problems: List[ProblemSummary]
