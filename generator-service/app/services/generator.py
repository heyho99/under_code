import os

from app.clients.llm_client import LLMError, call_llm
from app.schemas.generator import GenerateRequest, GenerateResponse
from app.services.debug_outputs import save_debug_outputs, save_prompt, save_raw_llm_response
from app.services.prompt_builder import build_generation_prompt
from app.services.structured_markdown_parser import (
    StructuredMarkdownParseError,
    parse_structured_markdown,
)


_MOCK_DATA = {
    "python": """# 1問目

## title
JSON入力の数値をそのまま出力

## statement
変数 `sysin` には JSON オブジェクト `{"n": number}` が入ります。`sysin["n"]` を JSON として1行で標準出力してください。

## sysinFormat
`{"n": number}`

## sampleAnswer
```python
import sys, json
sysin = json.loads(sys.stdin.read())
print(json.dumps(sysin["n"]))
```

## testcases
### testcase1
`{"sysin": {"n": 1}, "expected": 1}`
### testcase2
`{"sysin": {"n": 2}, "expected": 2}`

# 2問目

## title
2つの数値の合計を出力

## statement
変数 `sysin` には JSON オブジェクト `{"a": number, "b": number}` が入ります。`sysin["a"] + sysin["b"]` の結果を JSON として1行で標準出力してください。

## sysinFormat
`{"a": number, "b": number}`

## sampleAnswer
```python
import sys, json
sysin = json.loads(sys.stdin.read())
result = sysin["a"] + sysin["b"]
print(json.dumps(result))
```

## testcases
### testcase1
`{"sysin": {"a": 1, "b": 2}, "expected": 3}`
### testcase2
`{"sysin": {"a": 10, "b": 20}, "expected": 30}`
""",
    "go": """# 1問目

## title
JSON入力の数値をそのまま出力

## statement
標準入力から JSON オブジェクト `{"n": number}` を読み取り、その `n` の値を JSON として1行で標準出力してください。

## sysinFormat
`{"n": number}`

## sampleAnswer
```go
package main

import (
    "encoding/json"
    "os"
)

func main() {
    var sysin map[string]interface{}
    json.NewDecoder(os.Stdin).Decode(&sysin)
    json.NewEncoder(os.Stdout).Encode(sysin["n"])
}
```

## testcases
### testcase1
`{"sysin": {"n": 1}, "expected": 1}`
### testcase2
`{"sysin": {"n": 2}, "expected": 2}`

# 2問目

## title
2つの数値の合計を出力

## statement
標準入力から JSON オブジェクト `{"a": number, "b": number}` を読み取り、`a + b` の結果を JSON として1行で標準出力してください。

## sysinFormat
`{"a": number, "b": number}`

## sampleAnswer
```go
package main

import (
    "encoding/json"
    "os"
)

func main() {
    var sysin map[string]float64
    json.NewDecoder(os.Stdin).Decode(&sysin)
    result := sysin["a"] + sysin["b"]
    json.NewEncoder(os.Stdout).Encode(result)
}
```

## testcases
### testcase1
`{"sysin": {"a": 1, "b": 2}, "expected": 3}`
### testcase2
`{"sysin": {"a": 10, "b": 20}, "expected": 30}`
"""
}


def _get_primary_category(request: GenerateRequest) -> str:
    """problemCounts のキーから最初のカテゴリを取得する"""
    for f in request.files:
        for k in (f.problemCounts or {}).keys():
            return k
    return "syntax"


async def generate(request: GenerateRequest) -> GenerateResponse:
    all_problems = []
    markdowns = []

    # 各ファイルに対して問題を生成する
    for f in request.files:
        effective_language = (getattr(f, "defaultLanguage", None) or request.defaultLanguage or "python3")

        single_request = GenerateRequest(
            userId=request.userId,
            title=request.title,
            description=request.description,
            defaultLanguage=effective_language,
            files=[f],
        )

        category = _get_primary_category(single_request)
        prompt = build_generation_prompt(single_request, category=category)
        save_prompt(prompt)

        if os.getenv("GENERATOR_MOCK") == "1":
            # 言語に応じたモックデータを選択
            lang_key = effective_language.lower().replace("python3", "python")
            markdown = _MOCK_DATA.get(lang_key, _MOCK_DATA["python"])
        else:
            markdown = await call_llm(prompt)

        markdowns.append(markdown)

        try:
            problems = parse_structured_markdown(markdown, category=category, default_language=effective_language)
        except StructuredMarkdownParseError as e:
            raise StructuredMarkdownParseError(f"{f.fileName}: {e}") from e

        all_problems.extend(problems)

    combined_markdown = "\n\n".join(markdowns)
    save_raw_llm_response(combined_markdown)
    save_debug_outputs(combined_markdown, all_problems)
    return GenerateResponse(problems=all_problems)
