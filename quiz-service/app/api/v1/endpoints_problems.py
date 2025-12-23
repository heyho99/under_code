from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.problem import ProblemDetail, ProblemLanguageItem
from app.services import problem_service


router = APIRouter()


@router.get("/quiz/problems/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int) -> ProblemDetail:
    detail = await problem_service.get_problem_detail(problem_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    return detail


@router.get("/quiz/quizzes/stats/count")
async def get_quiz_stats_count(userId: Optional[int] = Query(None, description="User ID")) -> dict:
    total = await problem_service.get_total_problem_count(userId)
    return {"totalProblems": total}


@router.get("/quiz/quizzes/stats/categories")
async def get_quiz_stats_categories(userId: Optional[int] = Query(None, description="User ID")):
    categories = await problem_service.get_category_stats(userId)
    return categories


@router.get("/quiz/problem-categories")
async def list_problem_categories(userId: Optional[int] = Query(None, description="User ID")):
    rows = await problem_service.list_problem_categories(userId)
    return rows


@router.get("/quiz/problem-languages", response_model=List[ProblemLanguageItem])
async def list_problem_languages(userId: Optional[int] = Query(None, description="User ID")) -> List[ProblemLanguageItem]:
    rows = await problem_service.list_problem_languages(userId)
    return [ProblemLanguageItem(**r) for r in (rows or [])]
