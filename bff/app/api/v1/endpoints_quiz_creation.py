from fastapi import APIRouter, status, Query
from app.schemas.quiz_creation import (
    SourceUploadRequest,
    SourceUploadResponse,
    GenerateQuizRequest,
    GenerateQuizResponse,
    AnalysisResponse,
    TreeNode,
)

router = APIRouter()


@router.post("/upload", response_model=SourceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_source(data: SourceUploadRequest):
    return SourceUploadResponse(
        sourceId=5001,
        message="Mock upload successful",
    )


@router.get("/analysis", response_model=AnalysisResponse)
async def get_analysis(sourceId: int = Query(..., description="Source ID")):
    # 現時点では sourceId はモックのため利用しない
    return AnalysisResponse(
        root=TreeNode(
            name="my-react-app",
            type="directory",
            children=[
                TreeNode(
                    name="app",
                    type="directory",
                    children=[
                        TreeNode(
                            name="api",
                            type="directory",
                            children=[
                                TreeNode(
                                    name="router.py",
                                    type="file",
                                    children=[],
                                )
                            ],
                        ),
                        TreeNode(
                            name="services",
                            type="directory",
                            children=[
                                TreeNode(
                                    name="service.py",
                                    type="file",
                                    children=[],
                                )
                            ],
                        ),
                        TreeNode(
                            name="main.py",
                            type="file",
                            children=[],
                        ),
                    ],
                ),
                TreeNode(
                    name="tests",
                    type="directory",
                    children=[
                        TreeNode(
                            name="test_auth.py",
                            type="file",
                            children=[],
                        )
                    ],
                ),
            ],
        )
    )


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest):
    return GenerateQuizResponse(
        quizSetId=205,
    )
