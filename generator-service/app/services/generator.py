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
    all_problems = []
    markdowns = []

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

        if os.getenv("GENERATOR_MOCK") == "1":
            markdown = _MOCK_STRUCTURED_MD
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
