from pydantic import BaseModel
from typing import List, Optional


class ProblemCounts(BaseModel):
    syntax: int = 0


class FileWithProblems(BaseModel):
    fileName: str
    defaultLanguage: Optional[str] = None
    content: str
    problemCounts: ProblemCounts


class GenerateQuizRequest(BaseModel):
    title: str
    description: Optional[str] = None
    defaultLanguage: str = "python3"
    files: List[FileWithProblems]  # fils:[{fileName:str, content:str, problemCounts:{}},{}...]


class GenerateQuizResponse(BaseModel):
    quizSetId: int
    totalProblems: int
