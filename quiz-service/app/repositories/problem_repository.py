from app.db import database


async def get_problem(problem_id: int):
    return await database.fetchrow(
        """
        SELECT id, quiz_set_id, order_index, title, category, statement, sysin_format, default_language, sample_answer, testcases
        FROM problems
        WHERE id = $1
        """,
        problem_id,
    )


async def count_all_problems(user_id):
    if user_id is None:
        row = await database.fetchrow(
            """
            SELECT COUNT(*) AS count
            FROM problems p
            INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
            """,
        )
    else:
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


async def count_problems_by_category(user_id):
    if user_id is None:
        return await database.fetch(
            """
            SELECT p.category, COUNT(*) AS count
            FROM problems p
            INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
            GROUP BY p.category
            ORDER BY p.category
            """,
        )

    return await database.fetch(
        """
        SELECT p.category, COUNT(*) AS count
        FROM problems p
        INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
        WHERE q.user_id = $1
        GROUP BY p.category
        ORDER BY p.category
        """,
        user_id,
    )


async def list_problem_languages(user_id):
    if user_id is None:
        return await database.fetch(
            """
            SELECT p.id AS problem_id, p.default_language
            FROM problems p
            INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
            """,
        )

    return await database.fetch(
        """
        SELECT p.id AS problem_id, p.default_language
        FROM problems p
        INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
        WHERE q.user_id = $1
        """,
        user_id,
    )


async def list_problem_categories(user_id):
    if user_id is None:
        return await database.fetch(
            """
            SELECT p.id AS problem_id, p.category AS category
            FROM problems p
            INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
            ORDER BY p.id
            """,
        )

    return await database.fetch(
        """
        SELECT p.id AS problem_id, p.category AS category
        FROM problems p
        INNER JOIN quiz_sets q ON q.id = p.quiz_set_id
        WHERE q.user_id = $1
        ORDER BY p.id
        """,
        user_id,
    )

