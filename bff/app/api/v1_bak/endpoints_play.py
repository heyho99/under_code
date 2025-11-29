from fastapi import APIRouter, HTTPException
from app.schemas.problems import ProblemDetail
from app.clients.quiz_client import QuizClient

router = APIRouter()
quiz_client = QuizClient()

@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int):
    try:
        # 模範解答は隠蔽すべきだが、API定義書にあるレスポンスにはsampleAnswerが含まれていないかもしれないし、
        # クライアント側で答え合わせに使わないなら消すべき。
        # しかしAPI定義書(api.md)の例ではレスポンスに含まれているためそのまま返す。
        response = await quiz_client.get_problem(problem_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
