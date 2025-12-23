from datetime import date, datetime, time, timedelta
from typing import List, Optional

from app.repositories import submission_repository
from app.schemas.submission import SubmissionCreate
from app.schemas.stats import ActivityItem


async def create_submission(payload: SubmissionCreate) -> int:
    return await submission_repository.insert_submission(
        user_id=payload.userId,
        problem_id=payload.problemId,
        is_correct=payload.isCorrect,
        language=payload.language,
    )


async def get_unique_solved_count(user_id: Optional[int]) -> int:
    return await submission_repository.count_unique_solved(user_id)


async def get_unique_attempted_count(user_id: Optional[int]) -> int:
    return await submission_repository.count_unique_attempted(user_id)


async def get_activities(user_id: Optional[int], period_days: int) -> List[ActivityItem]:
    today = date.today()
    start_date = today - timedelta(days=period_days - 1)
    start_dt = datetime.combine(start_date, time.min)

    by_day = await submission_repository.fetch_daily_counts(user_id=user_id, start_datetime=start_dt)

    items: List[ActivityItem] = []
    for i in range(period_days):
        d = start_date + timedelta(days=i)
        submissions_count, solved_count = by_day.get(d, (0, 0))
        items.append(
            ActivityItem(
                date=d,
                submissionsCount=submissions_count,
                solvedCount=solved_count,
            )
        )

    return items


async def get_solved_problem_ids(
    user_id: Optional[int],
    problem_ids: List[int],
    language: Optional[str] = None,
) -> List[int]:
    return await submission_repository.fetch_solved_problem_ids(
        user_id=user_id,
        problem_ids=problem_ids,
        language=language,
    )


async def get_attempted_problem_ids(
    user_id: Optional[int],
    problem_ids: List[int],
    language: Optional[str] = None,
) -> List[int]:
    return await submission_repository.fetch_attempted_problem_ids(
        user_id=user_id,
        problem_ids=problem_ids,
        language=language,
    )


async def get_language_unique_stats(user_id: Optional[int]):
    return await submission_repository.fetch_language_unique_stats(user_id=user_id)
