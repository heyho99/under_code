from fastapi import APIRouter, Query
from typing import List
from app.schemas.quiz_sets import QuizSetSummary, QuizSetDetail
from app.schemas.problems import ProblemSummary

router = APIRouter()


@router.get("", response_model=List[QuizSetSummary])
async def get_quiz_sets(userId: int = Query(...)):
    return [
        QuizSetSummary(
            quizSetId=205,
            title="React基礎",
            description="Mock quiz set",
            total=50,
            completed=20,
            progressRate=40.0,
        ),
        QuizSetSummary(
            quizSetId=204,
            title="SQL入門",
            description="Mock SQL quiz set",
            total=80,
            completed=40,
            progressRate=50.0,
        ),
    ]


@router.get("/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set_detail(quiz_set_id: int, userId: int = Query(...)):
    problems = [
        ProblemSummary(
            problemId=1001,
            title="Mock Problem 1",
            description="Mock description 1",
            isSolved=True,
        ),
        ProblemSummary(
            problemId=1002,
            title="Mock Problem 2",
            description="Mock description 2",
            isSolved=False,
        ),
    ]
    return QuizSetDetail(
        quizSetId=quiz_set_id,
        title="Mock quiz set detail",
        problems=problems,
    )
