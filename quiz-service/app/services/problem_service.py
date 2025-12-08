from typing import Optional

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
        description=row["description"],
        contentMarkdown=row["content_markdown"],
        sampleAnswer=row["sample_answer"],
    )


async def get_total_problem_count() -> int:
    return await problem_repository.count_all_problems()

