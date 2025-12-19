from pydantic import BaseModel


class SubmissionCreate(BaseModel):
    userId: int
    problemId: int
    isCorrect: bool


class SubmissionCreateResponse(BaseModel):
    submissionId: int
