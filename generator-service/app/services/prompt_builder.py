import logging
from pathlib import Path
from typing import Dict, List, Optional

from app.schemas.generator import FileWithProblems, GenerateRequest



logger = logging.getLogger(__name__)


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


def _load_prompt_template(category: str) -> str:
    prompts_dir = Path(__file__).resolve().parent.parent / "prompts"
    path = prompts_dir / f"{category}.md"
    return path.read_text(encoding="utf-8")


def _get_category_problem_count(request: GenerateRequest, category: str) -> int:
    total = 0

    def _add_counts(d: Optional[Dict[str, int]], source: str) -> None:
        nonlocal total
        for k, v in (d or {}).items():
            try:
                n = int(v)
            except Exception:
                continue
            if n <= 0:
                continue
            if k == category:
                total += n
            else:
                logger.warning("ignored problemCounts key '%s' in %s (active category: %s)", k, source, category)

    _add_counts(request.problemCounts, "request.problemCounts")
    for f in request.files:
        _add_counts(f.problemCounts, f"file.problemCounts ({f.fileName})")

    return total


def build_generation_prompt(request: GenerateRequest, category: str = "syntax") -> str:
    if not request.files:
        raise ValueError("at least one file is required")

    total = _get_category_problem_count(request, category)
    if total <= 0:
        total = 5

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

    template = _load_prompt_template(category)
    replacements = {
        "__GENERATOR_PROMPT_TOTAL__": str(total),
        "__GENERATOR_PROMPT_TITLE__": title,
        "__GENERATOR_PROMPT_DESCRIPTION__": description,
        "__GENERATOR_PROMPT_SOURCE_MD__": source_md,
    }

    for k, v in replacements.items():
        template = template.replace(k, v)

    return template
