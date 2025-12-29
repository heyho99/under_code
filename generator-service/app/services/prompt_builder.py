import logging
from pathlib import Path
from typing import Dict, List, Optional

from jinja2 import Environment, FileSystemLoader

from app.schemas.generator import FileWithProblems, GenerateRequest



logger = logging.getLogger(__name__)

# Initialize Jinja2 environment
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "prompts"
env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


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


LANGUAGE_CODE_BLOCK_MAP = {
    "python3": "python",
    "javascript": "javascript",
    "go": "go",
}

LANGUAGE_NAME_MAP = {
    "python3": "Python",
    "javascript": "JavaScript",
    "go": "Go",
}


def _get_category_problem_count(request: GenerateRequest, category: str) -> int:
    files_total = 0

    def _sum_for_category(d: Optional[Dict[str, int]], source: str) -> int:
        out = 0
        for k, v in (d or {}).items():
            try:
                n = int(v)
            except Exception:
                continue
            if n <= 0:
                continue
            if k == category:
                out += n
            else:
                logger.warning("ignored problemCounts key '%s' in %s (active category: %s)", k, source, category)
        return out

    for f in request.files:
        files_total += _sum_for_category(f.problemCounts, f"file.problemCounts ({f.fileName})")

    return files_total


def build_generation_prompt(request: GenerateRequest, category: str = "syntax") -> str:
    if not request.files:
        raise ValueError("at least one file is required")

    total = _get_category_problem_count(request, category)
    if total <= 0:
        total = 5

    language = request.defaultLanguage or "python3"
    code_block_lang = LANGUAGE_CODE_BLOCK_MAP.get(language, "python")
    language_name = LANGUAGE_NAME_MAP.get(language, language)

    sources: List[str] = []
    for f in request.files:
        sources.append(
            "\n".join(
                [
                    f"### {f.fileName}",
                    f"```{code_block_lang}",
                    f.content.rstrip("\n"),
                    "```",
                ]
            )
        )

    title = request.title or ""
    description = request.description or ""
    source_md = "\n\n".join(sources)

    template_name = f"{language}/{category}.jinja2"
    
    try:
        template = env.get_template(template_name)
    except Exception as e:
         # Fallback to python3 if template not found, or raise error. 
         # For now, let's better raise a clear error or default to python check.
         # The original code raised ValueError if path.exists() failed.
         logger.error(f"Failed to load template {template_name}: {e}")
         raise ValueError(f"Prompt template not found: {template_name}")

    rendered_prompt = template.render(
        total=str(total),
        title=title,
        description=description,
        source_md=source_md,
        language_name=language_name
    )

    return rendered_prompt
