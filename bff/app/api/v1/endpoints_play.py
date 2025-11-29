from fastapi import APIRouter
from app.schemas.problems import ProblemDetail

router = APIRouter()


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int):
    return ProblemDetail(
        problemId=problem_id,
        quizSetId=205,
        orderIndex=1,
        title="Mock Problem",
        description="This is a mock problem for testing.",
        contentMarkdown="## Mock Problem\nPlease solve this mock problem.",
        sampleAnswer="Mock sample answer",
    )
