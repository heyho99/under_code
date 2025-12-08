from app.db import database


async def get_problem(problem_id: int):
    return await database.fetchrow(
        """
        SELECT id, quiz_set_id, order_index, title, description, content_markdown, sample_answer
        FROM problems
        WHERE id = $1
        """,
        problem_id,
    )


async def count_all_problems() -> int:
    row = await database.fetchrow("SELECT COUNT(*) AS count FROM problems")
    return int(row["count"]) if row is not None else 0

