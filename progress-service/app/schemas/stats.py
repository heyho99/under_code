from datetime import date

from pydantic import BaseModel


class UniqueSolvedStatsResponse(BaseModel):
    completedProblems: int


class ActivityItem(BaseModel):
    date: date
    submissionsCount: int
    solvedCount: int
