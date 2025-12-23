from pydantic import BaseModel
from typing import List, Optional

class DashboardSummary(BaseModel):
    totalProblems: int
    attemptedProblems: int
    solvedProblems: int

class CategoryStat(BaseModel):
    category: str
    count: int
    attempted: int = 0
    solved: int = 0
    attemptedRate: int = 0
    solvedRate: int = 0


class LanguageStat(BaseModel):
    language: str
    attempted: int
    solved: int
    total: int = 0

class ActivityStat(BaseModel):
    date: str
    submissionsCount: int
    solvedCount: int
