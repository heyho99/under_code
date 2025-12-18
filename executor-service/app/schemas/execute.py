from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exitCode: int
