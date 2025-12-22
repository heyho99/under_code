from pydantic import BaseModel


class SubmissionCreate(BaseModel):
    userId: int
    problemId: int
    isCorrect: bool
    language: str = "python3"


class SubmissionCreateResponse(BaseModel):
    submissionId: int
