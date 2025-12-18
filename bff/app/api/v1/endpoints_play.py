import logging

from fastapi import APIRouter, Depends, HTTPException

from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id
from app.schemas.problems import ProblemDetail

router = APIRouter()
logger = logging.getLogger(__name__)
quiz_client = QuizClient()


STARTER_CODE_TEMPLATES = {
    "python3": 'import sys, json\nsysin = json.loads(sys.stdin.read())\n# ここから下をユーザが書く\nresult = None\nprint(json.dumps(result, ensure_ascii=False))\n',
    "javascript": 'const fs = require("fs");\nconst sysin = JSON.parse(fs.readFileSync(0, "utf8"));\n// ここから下をユーザが書く\nlet result = null;\nprocess.stdout.write(JSON.stringify(result) + "\\n");\n',
    "go": '''package main

import (
\t"encoding/json"
\t"fmt"
\t"io"
\t"os"
)

func main() {
\tvar sysin interface{}
\tb, err := io.ReadAll(os.Stdin)
\tif err != nil {
\t\tpanic(err)
\t}
\tif err := json.Unmarshal(b, &sysin); err != nil {
\t\tpanic(err)
\t}

\t// ここから下をユーザが書く
\tvar result interface{} = nil
\tout, err := json.Marshal(result)
\tif err != nil {
\t\tpanic(err)
\t}
\tfmt.Println(string(out))
}
''',
}


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail(problem_id: int, user_id: int = Depends(get_current_user_id)):
    try:
        data = await quiz_client.get_problem(problem_id)
    except Exception:
        logger.exception("Failed to fetch problem detail")
        raise HTTPException(status_code=502, detail="Failed to fetch problem detail")

    language = data.get("defaultLanguage", "python3")
    starter_code = STARTER_CODE_TEMPLATES.get(language, STARTER_CODE_TEMPLATES["python3"])

    return ProblemDetail(
        problemId=data.get("problemId"),
        quizSetId=data.get("quizSetId"),
        orderIndex=data.get("orderIndex"),
        title=data.get("title", ""),
        defaultLanguage=language,
        contentMarkdown=data.get("contentMarkdown", ""),
        sysinFormat=data.get("sysinFormat", ""),
        starterCode=starter_code,
        sampleAnswer=data.get("sampleAnswer"),
        testcases=data.get("testcases", []),
    )
