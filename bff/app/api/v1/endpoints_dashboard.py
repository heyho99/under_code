import logging
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.clients.progress_client import ProgressClient
from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id, is_admin_user_id
from app.schemas.dashboard import ActivityStat, CategoryStat, DashboardSummary

router = APIRouter()
logger = logging.getLogger(__name__)
progress_client = ProgressClient()
quiz_client = QuizClient()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        quiz_stats = await quiz_client.get_stats_count(scoped_user_id)
        progress_stats = await progress_client.get_unique_solved_count(scoped_user_id)
    except Exception:
        logger.exception("Failed to fetch dashboard summary")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard summary")

    return DashboardSummary(
        totalProblems=int(quiz_stats.get("totalProblems", 0) or 0),
        completedProblems=int(progress_stats.get("completedProblems", 0) or 0),
    )


@router.get("/categories", response_model=List[CategoryStat])
async def get_dashboard_categories(user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        categories = await quiz_client.get_stats_categories(scoped_user_id)
        problem_categories = await quiz_client.list_problem_categories(scoped_user_id)
    except Exception:
        logger.exception("Failed to fetch dashboard categories from quiz service")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard categories")

    category_counts: Dict[str, int] = {}
    for item in categories or []:
        cat = item.get("category")
        if not cat:
            continue
        category_counts[str(cat)] = int(item.get("count", 0) or 0)

    problem_ids_by_category: Dict[str, List[int]] = {}
    all_problem_ids: List[int] = []
    for row in problem_categories or []:
        cat = row.get("category")
        pid = row.get("problemId")
        if not cat or not isinstance(pid, int):
            continue
        key = str(cat)
        problem_ids_by_category.setdefault(key, []).append(pid)
        all_problem_ids.append(pid)

    solved_set = set()
    unique_problem_ids = sorted(set(all_problem_ids))
    if unique_problem_ids:
        try:
            solved_ids = await progress_client.get_solved_problems(scoped_user_id, unique_problem_ids)
            solved_set = set(int(x) for x in (solved_ids or []))
        except Exception:
            logger.exception("Failed to fetch solved problems for dashboard categories")
            raise HTTPException(status_code=502, detail="Failed to fetch dashboard categories")

    all_categories = sorted(set(list(category_counts.keys()) + list(problem_ids_by_category.keys())))

    results: List[CategoryStat] = []
    for cat in all_categories:
        count = int(category_counts.get(cat, 0) or 0)
        pids = problem_ids_by_category.get(cat, [])
        solved = sum(1 for pid in pids if pid in solved_set)
        rate = int(round((solved / count) * 100)) if count > 0 else 0
        results.append(CategoryStat(category=cat, count=count, solved=solved, rate=rate))

    return results


@router.get("/activities", response_model=List[ActivityStat])
async def get_dashboard_activities(user_id: int = Depends(get_current_user_id), period: int = Query(30)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        activities = await progress_client.get_activities(scoped_user_id, period)
    except Exception:
        logger.exception("Failed to fetch dashboard activities")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard activities")

    return [
        ActivityStat(
            date=a.get("date", ""),
            submissionsCount=int(a.get("submissionsCount", 0) or 0),
            solvedCount=int(a.get("solvedCount", 0) or 0),
        )
        for a in (activities or [])
    ]
