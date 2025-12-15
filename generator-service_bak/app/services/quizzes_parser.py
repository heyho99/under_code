from __future__ import annotations

import re
from typing import Any, Dict, List

from app.schemas.generator import GeneratedQuiz, GeneratedTestCase


BLOCK_START_RE = re.compile(r"\s*```python(?::\s*(\d+))?\s*$")
BLOCK_END_RE = re.compile(r"\s*```+\s*$")


def _assign_ids(blocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    used_ids = {b["id"] for b in blocks if b["id"] is not None}
    next_auto_id = 1

    for block in blocks:
        if block["id"] is None:
            while next_auto_id in used_ids:
                next_auto_id += 1
            block["id"] = next_auto_id
            used_ids.add(next_auto_id)
            next_auto_id += 1

    return blocks


def extract_python_blocks(text: str) -> List[Dict[str, Any]]:
    """Extract ```python:n code blocks from Markdown text.

    This mirrors the behavior of quiz_poc/backend/extract_quizzes.py but works on an in-memory string
    instead of reading from a file.
    """

    lines = text.splitlines()
    blocks: List[Dict[str, Any]] = []

    inside_block = False
    current_id: int | None = None
    current_lines: List[str] = []

    for line in lines:
        if not inside_block:
            m = BLOCK_START_RE.match(line)
            if m:
                inside_block = True
                current_id = int(m.group(1)) if m.group(1) is not None else None
                current_lines = []
        else:
            if BLOCK_END_RE.match(line):
                code = "\n".join(current_lines).rstrip("\n")
                blocks.append({"id": current_id, "code": code})
                inside_block = False
                current_id = None
                current_lines = []
            else:
                current_lines.append(line)

    return _assign_ids(blocks)


def build_quiz_from_block(block: Dict[str, Any]) -> GeneratedQuiz:
    """Exec a single python:n block and convert it into a GeneratedQuiz object.

    This is a direct adaptation of build_quiz_from_block in quiz_poc/backend/extract_quizzes.py.
    """

    namespace: Dict[str, Any] = {}
    code = block["code"]

    try:
        compiled = compile(code, f"<quiz {block['id']}>", "exec")
        exec(compiled, {}, namespace)
    except Exception as exc:  # pragma: no cover - basic error propagation
        raise RuntimeError(f"Failed to exec code for quiz id={block['id']}: {exc}") from exc

    required_keys = ["title", "description", "sysin_format", "sample_code"]
    for key in required_keys:
        if key not in namespace:
            raise KeyError(f"Missing required variable {key!r} in quiz id={block['id']}")

    testcases: List[GeneratedTestCase] = []
    raw_testcases: List[tuple[int, Dict[str, Any]]] = []

    for name, value in namespace.items():
        if not name.startswith("test_case_"):
            continue

        if not isinstance(value, dict):
            raise TypeError(f"{name} in quiz id={block['id']} is not a dict")

        if "sysin" not in value or "expected" not in value:
            raise KeyError(f"{name} in quiz id={block['id']} must contain 'sysin' and 'expected'")

        m = re.match(r"test_case_(\\d+)$", name)
        order = int(m.group(1)) if m else 0
        raw_testcases.append((order, value))

    raw_testcases.sort(key=lambda x: x[0])

    for _, tc in raw_testcases:
        testcases.append(
            GeneratedTestCase(
                sysin=repr(tc["sysin"]),
                expected=repr(tc["expected"]),
            )
        )

    return GeneratedQuiz(
        id=block["id"],
        title=repr(namespace["title"]),
        description=repr(namespace["description"]),
        sysin_format=repr(namespace["sysin_format"]),
        sample_code=repr(namespace["sample_code"]),
        testcases=testcases,
    )


def parse_quizzes_from_markdown(text: str) -> List[GeneratedQuiz]:
    """Parse quizzes.md style Markdown into a list of GeneratedQuiz objects."""

    blocks = extract_python_blocks(text)
    quizzes: List[GeneratedQuiz] = []

    for block in blocks:
        if not block["code"].strip():
            continue
        quizzes.append(build_quiz_from_block(block))

    return quizzes
