from typing import List, Optional, Tuple

from app.db import database
from app.schemas.problem import ProblemCreate


async def create_quiz_set_with_problems(
    user_id: int,
    title: str,
    description: Optional[str],
    problems: List[ProblemCreate],
) -> Tuple[int, int]:
    row = await database.fetchrow(
        "INSERT INTO quiz_sets (user_id, title, description) VALUES ($1, $2, $3) RETURNING id",
        user_id,
        title,
        description,
    )
    quiz_set_id = row["id"]

    query = (
        "INSERT INTO problems (quiz_set_id, order_index, title, description, content_markdown, sample_answer) "
        "VALUES ($1, $2, $3, $4, $5, $6)"
    )

    for index, problem in enumerate(problems, start=1):
        await database.execute(
            query,
            quiz_set_id,
            index,
            problem.title,
            problem.description,
            problem.contentMarkdown,
            problem.sampleAnswer,
        )

    return quiz_set_id, len(problems)


async def list_quiz_sets_by_user(user_id: int):
    return await database.fetch(
        "SELECT id, title, description FROM quiz_sets WHERE user_id = $1 ORDER BY id DESC",
        user_id,
    )


async def get_quiz_set_with_problems(quiz_set_id: int):
    quiz_row = await database.fetchrow(
        "SELECT id, user_id, title, description FROM quiz_sets WHERE id = $1",
        quiz_set_id,
    )
    if quiz_row is None:
        return None, []

    problem_rows = await database.fetch(
        "SELECT id, title, description, order_index FROM problems WHERE quiz_set_id = $1 ORDER BY order_index",
        quiz_set_id,
    )
    return quiz_row, problem_rows

