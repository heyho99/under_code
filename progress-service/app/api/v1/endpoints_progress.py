from typing import List

from fastapi import APIRouter, Query

from app.schemas.submission import SubmissionCreate, SubmissionCreateResponse
from app.schemas.stats import ActivityItem, UniqueSolvedStatsResponse
from app.services.progress_service import (
    create_submission,
    get_activities,
    get_unique_solved_count,
)


router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/submissions", response_model=SubmissionCreateResponse)
async def post_submission(payload: SubmissionCreate) -> SubmissionCreateResponse:
    submission_id = await create_submission(payload)
    return SubmissionCreateResponse(submissionId=submission_id)


@router.get("/stats/unique-solved", response_model=UniqueSolvedStatsResponse)
async def get_unique_solved(userId: int = Query(...)) -> UniqueSolvedStatsResponse:
    count = await get_unique_solved_count(userId)
    return UniqueSolvedStatsResponse(completedProblems=count)


@router.get("/activities", response_model=List[ActivityItem])
async def get_user_activities(
    userId: int = Query(...),
    period: int = Query(..., ge=1),
) -> List[ActivityItem]:
    items = await get_activities(user_id=userId, period_days=period)
    return items
