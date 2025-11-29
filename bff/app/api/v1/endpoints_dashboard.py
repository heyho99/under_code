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
async def get_dashboard_activities(userId: int = Query(...), period: int = Query(30)):
    return [
        ActivityStat(date="2023-09-16", count=0),
        ActivityStat(date="2023-09-17", count=2),
        ActivityStat(date="2023-09-18", count=1),
        ActivityStat(date="2023-09-19", count=3),
        ActivityStat(date="2023-09-20", count=0),
        ActivityStat(date="2023-09-21", count=4),
        ActivityStat(date="2023-09-22", count=0),
        ActivityStat(date="2023-09-23", count=2),
        ActivityStat(date="2023-09-24", count=1),
        ActivityStat(date="2023-09-25", count=0),
        ActivityStat(date="2023-09-26", count=3),
        ActivityStat(date="2023-09-27", count=1),
        ActivityStat(date="2023-09-28", count=2),
        ActivityStat(date="2023-09-29", count=0),
        ActivityStat(date="2023-09-30", count=4),
        ActivityStat(date="2023-10-01", count=3),
        ActivityStat(date="2023-10-02", count=0),
        ActivityStat(date="2023-10-03", count=2),
        ActivityStat(date="2023-10-04", count=1),
        ActivityStat(date="2023-10-05", count=0),
        ActivityStat(date="2023-10-06", count=5),
        ActivityStat(date="2023-10-07", count=0),
        ActivityStat(date="2023-10-08", count=3),
        ActivityStat(date="2023-10-09", count=1),
        ActivityStat(date="2023-10-10", count=2),
        ActivityStat(date="2023-10-11", count=0),
        ActivityStat(date="2023-10-12", count=4),
        ActivityStat(date="2023-10-13", count=2),
        ActivityStat(date="2023-10-14", count=0),
        ActivityStat(date="2023-10-15", count=3),
        ActivityStat(date="2023-10-16", count=1),
        ActivityStat(date="2023-10-17", count=0),
        ActivityStat(date="2023-10-18", count=2),
        ActivityStat(date="2023-10-19", count=4),
        ActivityStat(date="2023-10-20", count=0),
        ActivityStat(date="2023-10-21", count=3),
        ActivityStat(date="2023-10-22", count=1),
        ActivityStat(date="2023-10-23", count=0),
        ActivityStat(date="2023-10-24", count=2),
        ActivityStat(date="2023-10-25", count=5),
        ActivityStat(date="2023-10-26", count=0),
        ActivityStat(date="2023-10-27", count=3),
        ActivityStat(date="2023-10-28", count=1),
        ActivityStat(date="2023-10-29", count=0),
        ActivityStat(date="2023-10-30", count=2),
    ]
