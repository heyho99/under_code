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

class FileWithProblems(BaseModel):
    fileName: str
    content: str
    problemCounts: ProblemCounts

class GenerateQuizRequest(BaseModel):
    userId: int
    title: str
    files: List[FileWithProblems]  # fils:[{fileName:str, content:str, problemCounts:{}},{}...]

class GenerateQuizResponse(BaseModel):
    quizSetId: int


TreeNode.model_rebuild()
