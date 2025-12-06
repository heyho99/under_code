from pydantic import BaseModel
from typing import List, Optional

class ProblemCounts(BaseModel):
    syntax: int = 0

class FileWithProblems(BaseModel):
    fileName: str
    content: str
    problemCounts: ProblemCounts

class GenerateQuizRequest(BaseModel):
    userId: int
    title: str
    description: Optional[str] = None
    files: List[FileWithProblems]  # fils:[{fileName:str, content:str, problemCounts:{}},{}...]

class GenerateQuizResponse(BaseModel):
    quizSetId: int
