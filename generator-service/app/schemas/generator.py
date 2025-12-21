from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class FileWithProblems(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fileName: str
    defaultLanguage: Optional[str] = None
    content: str
    problemCounts: Dict[str, int] = Field(default_factory=dict)


class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    userId: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    defaultLanguage: str = "python3"
    files: List[FileWithProblems]


class GeneratedTestCase(BaseModel):
    sysin: Any
    expected: Any


class GeneratedProblem(BaseModel):
    title: str
    category: str
    statement: str
    sysinFormat: str
    defaultLanguage: str
    sampleAnswer: str
    testcases: List[GeneratedTestCase]


class GenerateResponse(BaseModel):
    problems: List[GeneratedProblem]
