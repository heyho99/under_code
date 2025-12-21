import logging

from fastapi import APIRouter, Depends, HTTPException

from app.clients.quiz_client import QuizClient
from app.core.security import get_current_user_id
from app.schemas.problems import ProblemDetail

router = APIRouter()
logger = logging.getLogger(__name__)
quiz_client = QuizClient()


STARTER_CODE_TEMPLATES = {
    "python3": 'import sys, json\n'
               'sysin = json.loads(sys.stdin.read())  # stdinからJSONを読み取ってsysinへ\n'
               '\n'
               '# ここから下をユーザが書く（sysinを使ってresultを作る）\n'
               'result = None  # TODO: ここに処理結果を入れる\n'
               '\n'
               'print(json.dumps(result, ensure_ascii=False))  # JSONとして出力\n',
    "javascript": 'const fs = require("fs"); // 標準入力(stdin)を読むためのfs\n'
                  'const sysin = JSON.parse(fs.readFileSync(0, "utf8")); // stdin(JSON) -> sysin\n'
                  '\n'
                  '// ここから下をユーザが書く（sysinを使ってresultを作る）\n'
                  'let result = null; // TODO: ここに処理結果を入れる\n'
                  '\n'
                  'process.stdout.write(JSON.stringify(result) + "\\n"); // JSONとして出力\n',
    "go": '''package main

import (
\t"encoding/json"
\t"fmt"
\t"io"
\t"os"
)

func main() {
\tvar sysin interface{} // 入力(JSON)を受け取る変数
\tb, err := io.ReadAll(os.Stdin) // stdinを全て読む
\tif err != nil {
\t\tpanic(err)
\t}
\tif err := json.Unmarshal(b, &sysin); err != nil { // JSONをパースしてsysinへ
\t\tpanic(err)
\t}

\t// ここから下をユーザが書く（sysinを使ってresultを作る）
\tvar result interface{} = nil // TODO: ここに処理結果を入れる
\tout, err := json.Marshal(result) // result -> JSON
\tif err != nil {
\t\tpanic(err)
\t}
\tfmt.Println(string(out)) // JSONを出力
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
        statement=data.get("statement", ""),
        sysinFormat=data.get("sysinFormat", ""),
        starterCode=starter_code,
        sampleAnswer=data.get("sampleAnswer"),
        testcases=data.get("testcases", []),
    )
