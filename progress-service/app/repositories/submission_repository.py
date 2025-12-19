from datetime import date, datetime
from typing import Dict, List, Tuple

from app.db import database


async def insert_submission(user_id: int, problem_id: int, is_correct: bool) -> int:
    row = await database.fetchrow(
        """
        INSERT INTO submissions (user_id, problem_id, is_correct)
        VALUES ($1, $2, $3)
        RETURNING submission_id
        """,
        user_id,
        problem_id,
        is_correct,
    )
    if not row:
        raise RuntimeError("failed to insert submission")
    return int(row["submission_id"])


async def count_unique_solved(user_id: int) -> int:
    row = await database.fetchrow(
        """
        SELECT COUNT(DISTINCT problem_id) AS cnt
        FROM submissions
        WHERE user_id = $1 AND is_correct = TRUE
        """,
        user_id,
    )
    return int(row["cnt"] or 0)


async def fetch_daily_counts(user_id: int, start_datetime: datetime) -> Dict[date, Tuple[int, int]]:
    rows = await database.fetch(
        """
        SELECT
            DATE(created_at) AS day,
            COUNT(*) AS submissions_count,
            COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) AS solved_count
        FROM submissions
        WHERE user_id = $1 AND created_at >= $2
        GROUP BY day
        ORDER BY day ASC
        """,
        user_id,
        start_datetime,
    )

    result: Dict[date, Tuple[int, int]] = {}
    for r in rows:
        d: date = r["day"]
        result[d] = (int(r["submissions_count"]), int(r["solved_count"]))
    return result
