from datetime import date, datetime
from typing import Dict, List, Tuple

from app.db import database


async def insert_submission(user_id: int, problem_id: int, is_correct: bool, language: str) -> int:
    row = await database.fetchrow(
        """
        INSERT INTO submissions (user_id, problem_id, is_correct, language)
        VALUES ($1, $2, $3, $4)
        RETURNING submission_id
        """,
        user_id,
        problem_id,
        is_correct,
        language,
    )
    if not row:
        raise RuntimeError("failed to insert submission")
    return int(row["submission_id"])


async def count_unique_solved(user_id) -> int:
    if user_id is None:
        row = await database.fetchrow(
            """
            SELECT COUNT(DISTINCT (user_id, problem_id)) AS cnt
            FROM submissions
            WHERE is_correct = TRUE
            """,
        )
    else:
        row = await database.fetchrow(
            """
            SELECT COUNT(DISTINCT problem_id) AS cnt
            FROM submissions
            WHERE user_id = $1 AND is_correct = TRUE
            """,
            user_id,
        )
    return int(row["cnt"] or 0)


async def count_unique_attempted(user_id) -> int:
    if user_id is None:
        row = await database.fetchrow(
            """
            SELECT COUNT(DISTINCT (user_id, problem_id)) AS cnt
            FROM submissions
            """,
        )
    else:
        row = await database.fetchrow(
            """
            SELECT COUNT(DISTINCT problem_id) AS cnt
            FROM submissions
            WHERE user_id = $1
            """,
            user_id,
        )
    return int(row["cnt"] or 0)


async def fetch_daily_counts(user_id, start_datetime: datetime) -> Dict[date, Tuple[int, int]]:
    if user_id is None:
        rows = await database.fetch(
            """
            SELECT
                DATE(created_at) AS day,
                COUNT(*) AS submissions_count,
                COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) AS solved_count
            FROM submissions
            WHERE created_at >= $1
            GROUP BY day
            ORDER BY day ASC
            """,
            start_datetime,
        )
    else:
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


async def fetch_solved_problem_ids(user_id, problem_ids: List[int]) -> List[int]:
    if not problem_ids:
        return []

    if user_id is None:
        rows = await database.fetch(
            """
            SELECT DISTINCT problem_id
            FROM submissions
            WHERE is_correct = TRUE
              AND problem_id = ANY($1)
            """,
            problem_ids,
        )
    else:
        rows = await database.fetch(
            """
            SELECT DISTINCT problem_id
            FROM submissions
            WHERE user_id = $1
              AND is_correct = TRUE
              AND problem_id = ANY($2)
            """,
            user_id,
            problem_ids,
        )

    return [int(r["problem_id"]) for r in rows]


async def fetch_attempted_problem_ids(user_id, problem_ids: List[int]) -> List[int]:
    if not problem_ids:
        return []

    if user_id is None:
        rows = await database.fetch(
            """
            SELECT DISTINCT problem_id
            FROM submissions
            WHERE problem_id = ANY($1)
            """,
            problem_ids,
        )
    else:
        rows = await database.fetch(
            """
            SELECT DISTINCT problem_id
            FROM submissions
            WHERE user_id = $1
              AND problem_id = ANY($2)
            """,
            user_id,
            problem_ids,
        )

    return [int(r["problem_id"]) for r in rows]


async def fetch_language_unique_stats(user_id) -> List[Dict[str, int]]:
    if user_id is None:
        rows = await database.fetch(
            """
            SELECT
              language,
              COUNT(DISTINCT (user_id, problem_id)) AS attempted,
              COUNT(DISTINCT (user_id, problem_id)) FILTER (WHERE is_correct = TRUE) AS solved
            FROM submissions
            GROUP BY language
            ORDER BY language ASC
            """,
        )
    else:
        rows = await database.fetch(
            """
            SELECT
              language,
              COUNT(DISTINCT problem_id) AS attempted,
              COUNT(DISTINCT problem_id) FILTER (WHERE is_correct = TRUE) AS solved
            FROM submissions
            WHERE user_id = $1
            GROUP BY language
            ORDER BY language ASC
            """,
            user_id,
        )

    return [
        {
            "language": str(r["language"]),
            "attempted": int(r["attempted"] or 0),
            "solved": int(r["solved"] or 0),
        }
        for r in rows
    ]
