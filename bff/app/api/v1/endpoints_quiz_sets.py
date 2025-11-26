from fastapi import APIRouter, HTTPException, Query
from typing import List
import asyncio
from app.schemas.quiz_sets import QuizSetSummary, QuizSetDetail
from app.clients.quiz_client import QuizClient
from app.clients.progress_client import ProgressClient

router = APIRouter()
quiz_client = QuizClient()
progress_client = ProgressClient()

@router.get("", response_model=List[QuizSetSummary])
async def get_quiz_sets(userId: int = Query(...)):
    try:
        # 1. Quiz Sets 一覧取得
        quiz_sets = await quiz_client.get_quiz_sets(user_id=userId)
        
        if not quiz_sets:
            return []

        quiz_set_ids = [qs["quizSetId"] for qs in quiz_sets]
        
        # 2. 進捗取得
        progress_data = await progress_client.get_quiz_sets_status(user_id=userId, quiz_set_ids=quiz_set_ids)
        # progress_data: { "205": { "total":50, "completed": 20, "progressRate": 40 }, ... }
        
        # 3. Merge
        results = []
        for qs in quiz_sets:
            qs_id = str(qs["quizSetId"])
            prog = progress_data.get(qs_id, {"total": 0, "completed": 0, "progressRate": 0.0})
            
            summary = QuizSetSummary(
                quizSetId=qs["quizSetId"],
                title=qs["title"],
                description=qs.get("description", ""),
                total=prog["total"],
                completed=prog["completed"],
                progressRate=prog["progressRate"]
            )
            results.append(summary)
            
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set_detail(quiz_set_id: int, userId: int = Query(...)):
    try:
        # 1. 詳細取得 & 2. 解答済みリスト取得
        results = await asyncio.gather(
            quiz_client.get_quiz_set_detail(quiz_set_id=quiz_set_id),
            progress_client.get_solved_problems(user_id=userId, quiz_set_id=quiz_set_id)
        )
        
        detail = results[0] # { "quizSetId": ..., "problems": [...] }
        solved_ids = set(results[1]) # [1001, 1002] -> {1001, 1002}
        
        problems = []
        for p in detail.get("problems", []):
            p["isSolved"] = p["problemId"] in solved_ids
            problems.append(p)
            
        detail["problems"] = problems
        
        return detail
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
