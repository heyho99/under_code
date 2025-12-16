import json
from typing import Dict, List

from app.schemas.generator import FileWithProblems, GenerateRequest



def _aggregate_problem_counts(base: Dict[str, int], files: List[FileWithProblems]) -> Dict[str, int]:
    out: Dict[str, int] = dict(base or {})
    for f in files:
        for k, v in (f.problemCounts or {}).items():
            try:
                n = int(v)
            except Exception:
                continue
            if n <= 0:
                continue
            out[k] = out.get(k, 0) + n
    return out


def build_generation_prompt(request: GenerateRequest) -> str:
    if not request.files:
        raise ValueError("at least one file is required")

    counts = _aggregate_problem_counts(request.problemCounts, request.files)
    total = sum(counts.values())
    if total <= 0:
        total = 5

    counts_json = json.dumps(counts, ensure_ascii=False)

    sources: List[str] = []
    for f in request.files:
        sources.append(
            "\n".join(
                [
                    f"### {f.fileName}",
                    "```python",
                    f.content.rstrip("\n"),
                    "```",
                ]
            )
        )

    title = request.title or ""
    description = request.description or ""
    source_md = "\n\n".join(sources)

    return "\n".join(
        [
            "あなたはプログラミング教育の専門家です。",
            f"次のソースコードを題材に、{total}問のプログラミング問題を作成してください。",
            f"カテゴリ別の希望出題数: {counts_json}",
            "",
            "出力は必ず『構造化 Markdown』で、余計な説明は書かないでください。",
            "各問題は次のフォーマットで出力してください:",
            "",
            "# 1問目",
            "## title",
            "(1行)",
            "## content_markdown",
            "(Markdown本文)",
            "## sysinFormat",
            "(`...` でも plain text でもよい)",
            "## sampleCode",
            "```python",
            "(完全な実行可能コード。stdin を JSON として読み sysin に入れ、最後に JSON を1行で出力)",
            "```",
            "## testcases",
            "### testcase1",
            "`{\"sysin\": ..., \"expected\": ...}`",
            "### testcase2",
            "...",
            "",
            "制約:",
            "- testcases の各行は JSON として厳密に正しいこと（ダブルクオート、true/false/null、末尾カンマ禁止、単一引用符禁止）",
            "- sysin/expected は JSON で表現可能な値のみ（object/array/string/number/bool/null）",
            "- sampleCode の出力は stdout の最後の非空行が JSON としてパースできること",
            "",
            f"リクエストタイトル: {title}",
            f"リクエスト説明: {description}",
            "",
            "対象コード:",
            source_md,
        ]
    )
