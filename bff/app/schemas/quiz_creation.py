from pydantic import BaseModel, Field
from typing import List, Optional

class FileContent(BaseModel):
    path: str
    content: str

class SourceUploadRequest(BaseModel):
    userId: int
    project_name: str
    files: List[FileContent]

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
    logic: int = 0
    function: int = 0
    class_: int = Field(0, alias="class")

class GenerateQuizRequest(BaseModel):
    userId: int
    sourceId: int
    title: str
    problemCounts: ProblemCounts
    customInstruction: Optional[str] = None
    excludePaths: Optional[List[str]] = []

class GenerateQuizResponse(BaseModel):
    quizSetId: int


TreeNode.model_rebuild()
