from typing import List, Optional

from app.repositories import quiz_set_repository
from app.schemas.quiz_set import (
    QuizSetGenerateRequest,
    QuizSetGenerateResponse,
    QuizSetSummary,
    QuizSetDetail,
)
from app.schemas.problem import ProblemSummary


async def create_quiz_set_from_generated(
    payload: QuizSetGenerateRequest,
) -> QuizSetGenerateResponse:
    quiz_set_id, total_problems = await quiz_set_repository.create_quiz_set_with_problems(
        user_id=payload.userId,
        title=payload.title,
        description=payload.description,
        problems=payload.problems,
    )
    return QuizSetGenerateResponse(quizSetId=quiz_set_id, totalProblems=total_problems)


async def list_quiz_sets(user_id: int) -> List[QuizSetSummary]:
    rows = await quiz_set_repository.list_quiz_sets_by_user(user_id)
    return [
        QuizSetSummary(
            quizSetId=row["id"],
            title=row["title"],
            description=row["description"],
        )
        for row in rows
    ]


async def get_quiz_set_detail(quiz_set_id: int) -> Optional[QuizSetDetail]:
    quiz_row, problem_rows = await quiz_set_repository.get_quiz_set_with_problems(quiz_set_id)
    if quiz_row is None:
        return None

    problems = [
        ProblemSummary(
            problemId=row["id"],
            title=row["title"],
            description=row["description"],
        )
        for row in problem_rows
    ]

    return QuizSetDetail(
        quizSetId=quiz_row["id"],
        title=quiz_row["title"],
        description=quiz_row["description"],
        problems=problems,
    )

