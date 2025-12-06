from pydantic import BaseModel
from typing import List

class SourceUploadRequest(BaseModel):
    userId: int
    project_name: str
    files: List[str]

class SourceUploadResponse(BaseModel):
    sourceId: int
    message: str


class TreeNode(BaseModel):
    name: str
    type: str  # "directory" or "file"
    children: List["TreeNode"] = []


class AnalysisResponse(BaseModel):
    root: TreeNode

class ProblemCounts(BaseModel):
    syntax: int = 0

class GenerateQuizRequest(BaseModel):
    userId: int
    sourceId: int
    title: str
    problemCounts: ProblemCounts

class GenerateQuizResponse(BaseModel):
    quizSetId: int


TreeNode.model_rebuild()
