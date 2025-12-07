from typing import List, Optional

from pydantic import BaseModel


class ProblemCounts(BaseModel):
    syntax: int = 0


class FileWithProblems(BaseModel):
    fileName: str
    content: str
    problemCounts: ProblemCounts


class GenerateRequest(BaseModel):
    userId: int
    title: str
    description: Optional[str] = None
    files: List[FileWithProblems]


class GeneratedTestCase(BaseModel):
    sysin: str
    expected: str


class GeneratedQuiz(BaseModel):
    id: int
    title: str
    description: str
    sysin_format: str
    sample_code: str
    testcases: List[GeneratedTestCase]


class GenerateResponse(BaseModel):
    quizzes: List[GeneratedQuiz]

