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
        "INSERT INTO problems "
        "(quiz_set_id, order_index, title, category, statement, sysin_format, default_language, sample_answer, testcases) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)"
    )

    for index, problem in enumerate(problems, start=1):
        testcases_payload = [tc.model_dump() for tc in problem.testcases]
        await database.execute(
            query,
            quiz_set_id,
            index,
            problem.title,
            problem.category,
            problem.statement,
            problem.sysinFormat,
            problem.defaultLanguage,
            problem.sampleAnswer,
            testcases_payload,
        )

    return quiz_set_id, len(problems)


async def list_quiz_sets_by_user(user_id: Optional[int]):
    if user_id is None:
        return await database.fetch(
            "SELECT id, title, description FROM quiz_sets ORDER BY id DESC",
        )

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
        "SELECT id, title, order_index, default_language FROM problems WHERE quiz_set_id = $1 ORDER BY order_index",
        quiz_set_id,
    )
    return quiz_row, problem_rows


async def delete_quiz_set(quiz_set_id: int) -> bool:
    """
    クイズセットを削除する。
    ON DELETE CASCADE により関連する problems も自動削除される。
    submissions は外部キー制約がないため残る（孤児レコード）。

    Returns:
        bool: 削除に成功した場合 True、該当セットが存在しない場合 False
    """
    result = await database.execute(
        "DELETE FROM quiz_sets WHERE id = $1",
        quiz_set_id,
    )
    return result == "DELETE 1"
