import os

from app.clients.llm_client import LLMError, call_llm
from app.schemas.generator import GenerateRequest, GenerateResponse
from app.services.debug_outputs import save_debug_outputs, save_raw_llm_response
from app.services.prompt_builder import build_generation_prompt
from app.services.structured_markdown_parser import (
    StructuredMarkdownParseError,
    parse_structured_markdown,
)


_MOCK_STRUCTURED_MD = """# 1問目

## title
JSON入力の数値をそのまま出力

## statement
変数 `sysin` には JSON オブジェクト `{\"n\": number}` が入ります。`sysin[\"n\"]` を JSON として1行で標準出力してください。

## sysinFormat
`{\"n\": number}`

## sampleAnswer
```python
import sys, json
sysin = json.loads(sys.stdin.read())
print(json.dumps(sysin["n"]))
```

## testcases
### testcase1
`{\"sysin\": {\"n\": 1}, \"expected\": 1}`
### testcase2
`{\"sysin\": {\"n\": 2}, \"expected\": 2}`
"""


def _get_primary_category(request: GenerateRequest) -> str:
    """problemCounts のキーから最初のカテゴリを取得する"""
    for f in request.files:
        for k in (f.problemCounts or {}).keys():
            return k
    return "syntax"


async def generate(request: GenerateRequest) -> GenerateResponse:
    category = _get_primary_category(request)
    default_language = request.defaultLanguage

    prompt = build_generation_prompt(request, category=category)

    if os.getenv("GENERATOR_MOCK") == "1":
        markdown = _MOCK_STRUCTURED_MD
    else:
        markdown = await call_llm(prompt)

    save_raw_llm_response(markdown)
    problems = parse_structured_markdown(markdown, category=category, default_language=default_language)
    save_debug_outputs(markdown, problems)
    return GenerateResponse(problems=problems)
