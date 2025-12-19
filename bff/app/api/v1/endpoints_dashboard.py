import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.clients.progress_client import ProgressClient
from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id
from app.schemas.dashboard import ActivityStat, CategoryStat, DashboardSummary

router = APIRouter()
logger = logging.getLogger(__name__)
progress_client = ProgressClient()
quiz_client = QuizClient()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: int = Depends(get_current_user_id)):
    try:
        quiz_stats = await quiz_client.get_stats_count(user_id)
        progress_stats = await progress_client.get_unique_solved_count(user_id)
    except Exception:
        logger.exception("Failed to fetch dashboard summary")
        raise HTTPException(status_code=502, detail="Failed to fetch dashboard summary")

    return DashboardSummary(
        totalProblems=int(quiz_stats.get("totalProblems", 0) or 0),
        completedProblems=int(progress_stats.get("completedProblems", 0) or 0),
    )


@router.get("/categories", response_model=List[CategoryStat])
async def get_dashboard_categories(user_id: int = Depends(get_current_user_id)):
    data = [
        {"category": "syntax", "count": 40, "solved": 15},
        {"category": "logic", "count": 40, "solved": 10},
        {"category": "function", "count": 40, "solved": 12},
        {"category": "class", "count": 30, "solved": 8},
    ]

    results = []
    for item in data:
        count = item["count"]
        solved = item["solved"]
        rate = int(round((solved / count) * 100)) if count > 0 else 0
        results.append(
            CategoryStat(
                category=item["category"],
                count=count,
                solved=solved,
                rate=rate,
            )
        )

    return results


@router.get("/activities", response_model=List[ActivityStat])
async def get_dashboard_activities(user_id: int = Depends(get_current_user_id), period: int = Query(30)):
    try:
        activities = await progress_client.get_activities(user_id, period)
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
