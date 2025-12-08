from fastapi import APIRouter, HTTPException, status

from app.schemas.problem import ProblemDetail
from app.services import problem_service


router = APIRouter()


@router.get("/quiz/problems/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int) -> ProblemDetail:
    detail = await problem_service.get_problem_detail(problem_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    return detail


@router.get("/quiz/quizzes/stats/count")
async def get_quiz_stats_count() -> dict:
    total = await problem_service.get_total_problem_count()
    return {"totalProblems": total}
