from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class FileWithProblems(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fileName: str
    content: str
    problemCounts: Dict[str, int] = Field(default_factory=dict)


class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    userId: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    problemCounts: Dict[str, int] = Field(default_factory=dict)
    files: List[FileWithProblems]


class GeneratedTestCase(BaseModel):
    sysin: Any
    expected: Any


class GeneratedProblem(BaseModel):
    title: str
    contentMarkdown: str
    sysinFormat: str
    sampleAnswer: str
    testcases: List[GeneratedTestCase]


class GenerateResponse(BaseModel):
    problems: List[GeneratedProblem]
