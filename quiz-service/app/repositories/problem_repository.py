from typing import Optional

from app.db import database


async def get_problem(problem_id: int):
    return await database.fetchrow(
        """
        SELECT id, quiz_set_id, order_index, title, description, content_markdown, sysin_format, default_language, sample_answer, testcases
        FROM problems
        WHERE id = $1
        """,
        problem_id,
    )


async def count_all_problems(user_id: Optional[int] = None) -> int:
    if user_id is None:
        row = await database.fetchrow("SELECT COUNT(*) AS count FROM problems")
        return int(row["count"]) if row is not None else 0

    row = await database.fetchrow(
        """
        SELECT COUNT(*) AS count
        FROM problems p
        INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
        WHERE q.user_id = $1
        """,
        user_id,
    )
    return int(row["count"]) if row is not None else 0

