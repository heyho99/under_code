from pydantic import BaseModel
from typing import List, Optional

class DashboardSummary(BaseModel):
    totalProblems: int
    completedProblems: int

class CategoryStat(BaseModel):
    category: str
    count: int
    solved: int = 0 

class ActivityStat(BaseModel):
    date: str
    count: int
