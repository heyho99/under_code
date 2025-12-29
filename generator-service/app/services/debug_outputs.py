import os
from pathlib import Path
from typing import Sequence

from app.schemas.generator import GenerateResponse, GeneratedProblem


def save_raw_llm_response(markdown: str) -> None:
    """Save raw LLM response before parsing (useful for debugging parse errors)."""
    if os.getenv("GENERATOR_DEBUG_OUTPUTS") != "1":
        return

    base_dir = Path(__file__).resolve().parents[2]
    out_dir = base_dir / "debug_outputs"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "latest_llm.md").write_text(markdown, encoding="utf-8")


def save_prompt(prompt: str) -> None:
    """Save the prompt sent to LLM (useful for debugging prompt generation)."""
    if os.getenv("GENERATOR_DEBUG_OUTPUTS") != "1":
        return

    base_dir = Path(__file__).resolve().parents[2]
    out_dir = base_dir / "debug_outputs"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "latest_prompt.md").write_text(prompt, encoding="utf-8")


def save_debug_outputs(markdown: str, problems: Sequence[GeneratedProblem]) -> None:
    if os.getenv("GENERATOR_DEBUG_OUTPUTS") != "1":
        return

    base_dir = Path(__file__).resolve().parents[2]
    out_dir = base_dir / "debug_outputs"
    out_dir.mkdir(parents=True, exist_ok=True)

    data = GenerateResponse(problems=list(problems))
    (out_dir / "latest_problems.json").write_text(
        data.model_dump_json(indent=2),
        encoding="utf-8",
    )
