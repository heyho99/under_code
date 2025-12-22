from datetime import date

from pydantic import BaseModel


class UniqueSolvedStatsResponse(BaseModel):
    completedProblems: int


class UniqueAttemptedStatsResponse(BaseModel):
    attemptedProblems: int


class LanguageStatItem(BaseModel):
    language: str
    attempted: int
    solved: int


class ActivityItem(BaseModel):
    date: date
    submissionsCount: int
    solvedCount: int
