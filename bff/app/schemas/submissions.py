from pydantic import BaseModel

class ExecuteRequest(BaseModel):
    language: str
    code: str

class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exitCode: int

class SubmissionRequest(BaseModel):
    userId: int
    problemId: int
    submittedCode: str

class SubmissionResponse(BaseModel):
    isCorrect: bool
    message: str
    executionResult: ExecuteResponse
