from pathlib import Path
from typing import Sequence
import os

from app.schemas.generator import GeneratedQuiz, GenerateResponse


def save_debug_outputs(markdown: str, quizzes: Sequence[GeneratedQuiz]) -> None:
    if os.getenv("GENERATOR_DEBUG_OUTPUTS") != "1":
        return

    base_dir = Path(__file__).resolve().parents[2]
    out_dir = base_dir / "debug_outpus"
    out_dir.mkdir(parents=True, exist_ok=True)

    (out_dir / "latest_quizzes.md").write_text(markdown, encoding="utf-8")

    data = GenerateResponse(quizzes=list(quizzes))
    (out_dir / "latest_quizzes.json").write_text(
        data.model_dump_json(indent=2),
        encoding="utf-8",
    )
