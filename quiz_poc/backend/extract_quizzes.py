from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List


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


def build_quiz_from_block(block: Dict[str, Any]) -> Dict[str, Any]:
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

    quiz: Dict[str, Any] = {
        "id": block["id"],
        "title": repr(namespace["title"]),
        "description": repr(namespace["description"]),
        "sysin_format": repr(namespace["sysin_format"]),
        "sample_code": repr(namespace["sample_code"]),
        "testcases": [],
    }

    testcases: List[tuple[int, Dict[str, Any]]] = []

    for name, value in namespace.items():
        if not name.startswith("test_case_"):
            continue

        if not isinstance(value, dict):
            raise TypeError(f"{name} in quiz id={block['id']} is not a dict")

        if "sysin" not in value or "expected" not in value:
            raise KeyError(f"{name} in quiz id={block['id']} must contain 'sysin' and 'expected'")

        m = re.match(r"test_case_(\d+)$", name)
        order = int(m.group(1)) if m else 0
        testcases.append((order, value))

    testcases.sort(key=lambda x: x[0])

    for _, tc in testcases:
        quiz["testcases"].append(
            {
                "sysin": repr(tc["sysin"]),
                "expected": repr(tc["expected"]),
            }
        )

    return quiz


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    data_dir = base_dir / "data"
    md_path = data_dir / "quizzes.md"
    out_path = data_dir / "quizzes.json"

    text = md_path.read_text(encoding="utf-8")
    blocks = extract_python_blocks(text)

    quizzes: List[Dict[str, Any]] = []
    for block in blocks:
        if not block["code"].strip():
            continue
        quiz = build_quiz_from_block(block)
        quizzes.append(quiz)

    data = {"quizzes": quizzes}
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":  # pragma: no cover - script entry point
    main()
