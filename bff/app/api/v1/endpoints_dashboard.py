from fastapi import APIRouter, Query
from typing import List
from app.schemas.dashboard import DashboardSummary, CategoryStat, ActivityStat

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(userId: int = Query(..., description="User ID")):
    return DashboardSummary(
        totalProblems=150,
        completedProblems=45,
    )


@router.get("/categories", response_model=List[CategoryStat])
async def get_dashboard_categories(userId: int = Query(..., description="User ID")):
    return [
        CategoryStat(category="Frontend", count=50, solved=20),
        CategoryStat(category="Backend", count=80, solved=25),
    ]


@router.get("/activities", response_model=List[ActivityStat])
async def get_dashboard_activities(userId: int = Query(...), period: int = Query(30)):
    return [
        ActivityStat(date="2023-10-01", count=3),
        ActivityStat(date="2023-10-02", count=0),
    ]
