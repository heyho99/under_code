from typing import List

import logging
from fastapi import APIRouter, HTTPException, Query

from app.clients.quiz_client import QuizClient
from app.schemas.problems import ProblemSummary
from app.schemas.quiz_sets import QuizSetDetail, QuizSetSummary

router = APIRouter()
logger = logging.getLogger(__name__)
quiz_client = QuizClient()


@router.get("", response_model=List[QuizSetSummary])
async def get_quiz_sets(userId: int = Query(...)):
    try:
        quiz_sets = await quiz_client.get_quiz_sets(userId)
    except Exception:
        logger.exception("Failed to fetch quiz sets")
        raise HTTPException(status_code=502, detail="Failed to fetch quiz sets")

    return [
        QuizSetSummary(
            total=0,
            completed=0,
            progressRate=0.0,
            **quiz_set,
        )
        for quiz_set in quiz_sets
    ]


@router.get("/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set_detail(quiz_set_id: int, userId: int = Query(...)):
    try:
        data = await quiz_client.get_quiz_set_detail(quiz_set_id)
    except Exception:
        logger.exception("Failed to fetch quiz set detail")
        raise HTTPException(status_code=502, detail="Failed to fetch quiz set detail")

    problems = [
        ProblemSummary(
            problemId=p.get("problemId"),
            title=p.get("title", ""),
            description=p.get("description") or "",
            isSolved=False,
        )
        for p in data.get("problems") or []
    ]

    return QuizSetDetail(
        quizSetId=data.get("quizSetId"),
        title=data.get("title", ""),
        problems=problems,
    )
