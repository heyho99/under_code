from fastapi import APIRouter, HTTPException, Query
from typing import List
import asyncio
from app.schemas.dashboard import DashboardSummary, CategoryStat, ActivityStat
from app.clients.quiz_client import QuizClient
from app.clients.progress_client import ProgressClient

router = APIRouter()
quiz_client = QuizClient()
progress_client = ProgressClient()

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(userId: int = Query(..., description="User ID")):
    # 並列実行: Quiz Service(全問題数) & Progress Service(完了数)
    try:
        results = await asyncio.gather(
            quiz_client.get_stats_count(),
            progress_client.get_unique_solved_count(user_id=userId)
        )
        
        total_problems_data = results[0] # { "totalProblems": 150 }
        completed_problems_data = results[1] # { "completedProblems": 45 }
        
        return DashboardSummary(
            totalProblems=total_problems_data.get("totalProblems", 0),
            completedProblems=completed_problems_data.get("completedProblems", 0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=List[CategoryStat])
async def get_dashboard_categories(userId: int = Query(..., description="User ID")):
    try:
        results = await asyncio.gather(
            quiz_client.get_stats_categories(),
            progress_client.get_category_stats(user_id=userId)
        )
        
        # [{"category": "Frontend", "count": 50}, ...]
        quiz_categories = results[0] 
        # [{"category": "Frontend", "solved": 20}, ...]
        progress_categories = results[1]
        
        # Merge logic
        merged_map = {}
        
        for item in quiz_categories:
            cat = item["category"]
            merged_map[cat] = {"category": cat, "count": item["count"], "solved": 0}
            
        for item in progress_categories:
            cat = item["category"]
            if cat in merged_map:
                merged_map[cat]["solved"] = item["solved"]
            else:
                # クイズ側になくて進捗側にあるケースは稀だが一応
                merged_map[cat] = {"category": cat, "count": 0, "solved": item["solved"]}
        
        return list(merged_map.values())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activities", response_model=List[ActivityStat])
async def get_dashboard_activities(userId: int = Query(...), period: int = Query(30)):
    try:
        # Progress Serviceのみ
        response = await progress_client.get_activities(user_id=userId, period=period)
        return response # List[ActivityStat] compatible
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
