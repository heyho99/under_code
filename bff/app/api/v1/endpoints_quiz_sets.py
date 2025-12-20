import asyncio
from typing import Dict, List

import logging
from fastapi import APIRouter, Depends, HTTPException

from app.clients.progress_client import ProgressClient
from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id, is_admin_user_id
from app.schemas.problems import ProblemSummary
from app.schemas.quiz_sets import QuizSetDetail, QuizSetSummary

router = APIRouter()
logger = logging.getLogger(__name__)
quiz_client = QuizClient()
progress_client = ProgressClient()


@router.get("", response_model=List[QuizSetSummary])
async def get_quiz_sets(user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        quiz_sets = await quiz_client.get_quiz_sets(scoped_user_id)
    except Exception:
        logger.exception("Failed to fetch quiz sets")
        raise HTTPException(status_code=502, detail="Failed to fetch quiz sets")

    quiz_sets = quiz_sets or []
    if not quiz_sets:
        return []

    async def _fetch_detail(quiz_set_id: int) -> dict:
        return await quiz_client.get_quiz_set_detail(quiz_set_id)

    try:
        details = await asyncio.gather(
            *[_fetch_detail(int(qs.get("quizSetId"))) for qs in quiz_sets if qs.get("quizSetId") is not None]
        )
    except Exception:
        logger.exception("Failed to fetch quiz set details")
        raise HTTPException(status_code=502, detail="Failed to fetch quiz set details")

    detail_by_id: Dict[int, dict] = {int(d.get("quizSetId")): d for d in details if d and d.get("quizSetId") is not None}

    all_problem_ids: List[int] = []
    for d in detail_by_id.values():
        for p in d.get("problems") or []:
            pid = p.get("problemId")
            if isinstance(pid, int):
                all_problem_ids.append(pid)

    unique_problem_ids = sorted(set(all_problem_ids))

    solved_set = set()
    if unique_problem_ids:
        try:
            solved_ids = await progress_client.get_solved_problems(scoped_user_id, unique_problem_ids)
            solved_set = set(int(x) for x in (solved_ids or []))
        except Exception:
            logger.exception("Failed to fetch solved problems")
            raise HTTPException(status_code=502, detail="Failed to fetch solved problems")

    results: List[QuizSetSummary] = []
    for qs in quiz_sets:
        quiz_set_id = qs.get("quizSetId")
        if quiz_set_id is None:
            continue

        detail = detail_by_id.get(int(quiz_set_id)) or {}
        problem_ids = [p.get("problemId") for p in (detail.get("problems") or []) if isinstance(p.get("problemId"), int)]
        total = len(problem_ids)
        completed = sum(1 for pid in problem_ids if pid in solved_set)
        progress_rate = float((completed / total) * 100) if total > 0 else 0.0

        results.append(
            QuizSetSummary(
                total=total,
                completed=completed,
                progressRate=progress_rate,
                **qs,
            )
        )

    return results


@router.get("/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set_detail(quiz_set_id: int, user_id: int = Depends(get_current_user_id)):
    scoped_user_id = None if is_admin_user_id(user_id) else user_id
    try:
        data = await quiz_client.get_quiz_set_detail(quiz_set_id)
    except Exception:
        logger.exception("Failed to fetch quiz set detail")
        raise HTTPException(status_code=502, detail="Failed to fetch quiz set detail")

    raw_problems = data.get("problems") or []
    problem_ids = [p.get("problemId") for p in raw_problems if isinstance(p.get("problemId"), int)]

    solved_set = set()
    if problem_ids:
        try:
            solved_ids = await progress_client.get_solved_problems(scoped_user_id, problem_ids)
            solved_set = set(int(x) for x in (solved_ids or []))
        except Exception:
            logger.exception("Failed to fetch solved problems")
            raise HTTPException(status_code=502, detail="Failed to fetch solved problems")

    problems = [
        ProblemSummary(
            problemId=p.get("problemId"),
            title=p.get("title", ""),
            defaultLanguage=p.get("defaultLanguage", "python3"),
            isSolved=(p.get("problemId") in solved_set),
        )
        for p in raw_problems
        if p.get("problemId") is not None
    ]

    return QuizSetDetail(
        quizSetId=data.get("quizSetId"),
        title=data.get("title", ""),
        problems=problems,
    )
