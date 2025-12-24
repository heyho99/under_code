from typing import List, Optional

from fastapi import APIRouter, Query

from app.schemas.submission import SubmissionCreate, SubmissionCreateResponse
from app.schemas.stats import (
    ActivityItem,
    LanguageStatItem,
    UniqueAttemptedStatsResponse,
    UniqueSolvedStatsResponse,
)
from app.services.progress_service import (
    create_submission,
    get_activities,
    get_attempted_problem_ids,
    get_solved_problem_ids,
    get_language_unique_stats,
    get_problem_submission_stats,
    get_unique_attempted_count,
    get_unique_solved_count,
)


router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/submissions", response_model=SubmissionCreateResponse)
async def post_submission(payload: SubmissionCreate) -> SubmissionCreateResponse:
    submission_id = await create_submission(payload)
    return SubmissionCreateResponse(submissionId=submission_id)


@router.get("/stats/unique-solved", response_model=UniqueSolvedStatsResponse)
async def get_unique_solved(userId: Optional[int] = Query(None)) -> UniqueSolvedStatsResponse:
    count = await get_unique_solved_count(userId)
    return UniqueSolvedStatsResponse(completedProblems=count)


@router.get("/stats/unique-attempted", response_model=UniqueAttemptedStatsResponse)
async def get_unique_attempted(userId: Optional[int] = Query(None)) -> UniqueAttemptedStatsResponse:
    count = await get_unique_attempted_count(userId)
    return UniqueAttemptedStatsResponse(attemptedProblems=count)


@router.get("/activities", response_model=List[ActivityItem])
async def get_user_activities(
    userId: Optional[int] = Query(None),
    period: int = Query(..., ge=1),
) -> List[ActivityItem]:
    items = await get_activities(user_id=userId, period_days=period)
    return items


@router.get("/solved-problems", response_model=List[int])
async def get_solved_problems(
    userId: Optional[int] = Query(None),
    problemIds: str = Query(""),
    language: Optional[str] = Query(None),
) -> List[int]:
    raw = [p.strip() for p in (problemIds or "").split(",") if p.strip()]
    ids: List[int] = []
    for p in raw:
        try:
            ids.append(int(p))
        except ValueError:
            continue

    solved = await get_solved_problem_ids(user_id=userId, problem_ids=ids, language=language)
    return solved


@router.get("/attempted-problems", response_model=List[int])
async def get_attempted_problems(
    userId: Optional[int] = Query(None),
    problemIds: str = Query(""),
    language: Optional[str] = Query(None),
) -> List[int]:
    raw = [p.strip() for p in (problemIds or "").split(",") if p.strip()]
    ids: List[int] = []
    for p in raw:
        try:
            ids.append(int(p))
        except ValueError:
            continue

    attempted = await get_attempted_problem_ids(user_id=userId, problem_ids=ids, language=language)
    return attempted


@router.get("/stats/languages", response_model=List[LanguageStatItem])
async def get_language_stats(userId: Optional[int] = Query(None)) -> List[LanguageStatItem]:
    rows = await get_language_unique_stats(userId)
    return [LanguageStatItem(**r) for r in (rows or [])]


@router.get("/problem-stats")
async def get_problem_stats(
    userId: Optional[int] = Query(None),
    problemIds: str = Query(""),
):
    raw = [p.strip() for p in (problemIds or "").split(",") if p.strip()]
    ids: List[int] = []
    for p in raw:
        try:
            ids.append(int(p))
        except ValueError:
            continue

    stats = await get_problem_submission_stats(user_id=userId, problem_ids=ids)
    return stats
