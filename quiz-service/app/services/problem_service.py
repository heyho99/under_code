from typing import List, Optional

from app.repositories import problem_repository
from app.schemas.problem import ProblemDetail


async def get_problem_detail(problem_id: int) -> Optional[ProblemDetail]:
    row = await problem_repository.get_problem(problem_id)
    if row is None:
        return None

    return ProblemDetail(
        problemId=row["id"],
        quizSetId=row["quiz_set_id"],
        orderIndex=row["order_index"],
        title=row["title"],
        defaultLanguage=row["default_language"],
        statement=row["statement"],
        sysinFormat=row["sysin_format"],
        sampleAnswer=row["sample_answer"],
        testcases=row["testcases"],
    )


async def get_total_problem_count(user_id: Optional[int]) -> int:
    return await problem_repository.count_all_problems(user_id)


async def get_category_stats(user_id: Optional[int]) -> List[dict]:
    rows = await problem_repository.count_problems_by_category(user_id)
    return [{"category": row["category"], "count": row["count"]} for row in rows]


async def list_problem_categories(user_id: Optional[int]) -> List[dict]:
    rows = await problem_repository.list_problem_categories(user_id)
    return [
        {"problemId": int(row["problem_id"]), "category": row["category"]}
        for row in rows
    ]


async def list_problem_languages(user_id: Optional[int]) -> List[dict]:
    rows = await problem_repository.list_problem_languages(user_id)
    return [
        {"problemId": int(row["problem_id"]), "defaultLanguage": str(row["default_language"])}
        for row in rows
    ]

