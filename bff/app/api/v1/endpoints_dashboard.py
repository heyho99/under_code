import logging
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.clients.progress_client import ProgressClient
from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id, is_admin_user_id
from app.schemas.dashboard import ActivityStat, CategoryStat, DashboardSummary, LanguageStat

router = APIRouter()
logger = logging.getLogger(__name__)
progress_client = ProgressClient()
quiz_client = QuizClient()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        quiz_stats = await quiz_client.get_stats_count(scoped_user_id)
        attempted_stats = await progress_client.get_unique_attempted_count(scoped_user_id)
        solved_stats = await progress_client.get_unique_solved_count(scoped_user_id)
    except Exception:
        logger.exception("Failed to fetch dashboard summary")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard summary")

    return DashboardSummary(
        totalProblems=int(quiz_stats.get("totalProblems", 0) or 0),
        attemptedProblems=int(attempted_stats.get("attemptedProblems", 0) or 0),
        solvedProblems=int(solved_stats.get("completedProblems", 0) or 0),
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
    attempted_set = set()
    unique_problem_ids = sorted(set(all_problem_ids))
    if unique_problem_ids:
        try:
            solved_ids = await progress_client.get_solved_problems(scoped_user_id, unique_problem_ids)
            solved_set = set(int(x) for x in (solved_ids or []))
            attempted_ids = await progress_client.get_attempted_problems(scoped_user_id, unique_problem_ids)
            attempted_set = set(int(x) for x in (attempted_ids or []))
        except Exception:
            logger.exception("Failed to fetch solved problems for dashboard categories")
            raise HTTPException(status_code=502, detail="Failed to fetch dashboard categories")

    all_categories = sorted(set(list(category_counts.keys()) + list(problem_ids_by_category.keys())))

    results: List[CategoryStat] = []
    for cat in all_categories:
        count = int(category_counts.get(cat, 0) or 0)
        pids = problem_ids_by_category.get(cat, [])
        attempted = sum(1 for pid in pids if pid in attempted_set)
        solved = sum(1 for pid in pids if pid in solved_set)
        attempted_rate = int(round((attempted / count) * 100)) if count > 0 else 0
        solved_rate = int(round((solved / count) * 100)) if count > 0 else 0
        results.append(
            CategoryStat(
                category=cat,
                count=count,
                attempted=attempted,
                solved=solved,
                attemptedRate=attempted_rate,
                solvedRate=solved_rate,
            )
        )

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


@router.get("/languages", response_model=List[LanguageStat])
async def get_dashboard_languages(user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        items = await progress_client.get_language_stats(scoped_user_id)
    except Exception:
        logger.exception("Failed to fetch dashboard languages")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard languages")

    return [
        LanguageStat(
            language=str(i.get("language", "")),
            attempted=int(i.get("attempted", 0) or 0),
            solved=int(i.get("solved", 0) or 0),
        )
        for i in (items or [])
        if i and i.get("language")
    ]
