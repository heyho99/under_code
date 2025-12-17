import json
import re
from typing import Any, Dict, List

from app.schemas.generator import GeneratedProblem, GeneratedTestCase


class StructuredMarkdownParseError(ValueError):
    pass


_H2_RE = re.compile(r"^##(?!#)\s*(.+?)\s*$")
_INLINE_CODE_RE = re.compile(r"`([^`]*)`")


def _strip_wrapping_backticks(text: str) -> str:
    s = text.strip()
    if len(s) >= 2 and s.startswith("`") and s.endswith("`"):
        return s[1:-1].strip()
    return s


def parse_testcase_json_line(line: str) -> Dict[str, Any]:
    s = line.strip()
    if s.startswith("- "):
        s = s[2:].strip()
    s = _strip_wrapping_backticks(s)

    def _no_constants(x: str) -> Any:
        raise StructuredMarkdownParseError(f"invalid JSON constant: {x}")

    try:
        obj = json.loads(s, parse_constant=_no_constants)
    except Exception as exc:
        raise StructuredMarkdownParseError(f"invalid testcase JSON: {line}") from exc

    if not isinstance(obj, dict):
        raise StructuredMarkdownParseError("testcase must be a JSON object")
    if "sysin" not in obj or "expected" not in obj:
        raise StructuredMarkdownParseError("testcase JSON must contain 'sysin' and 'expected'")

    return {"sysin": obj["sysin"], "expected": obj["expected"]}


def validate_problem_is_jsonable(problem: GeneratedProblem) -> None:
    for tc in problem.testcases:
        try:
            json.dumps(tc.sysin, ensure_ascii=False, allow_nan=False)
            json.dumps(tc.expected, ensure_ascii=False, allow_nan=False)
        except Exception as exc:
            raise StructuredMarkdownParseError("testcase contains non-JSON value") from exc


def _split_problem_blocks(md: str) -> List[List[str]]:
    lines = md.splitlines()
    blocks: List[List[str]] = []
    current: List[str] = []
    started = False

    for line in lines:
        if line.startswith("# "):
            if started and current:
                blocks.append(current)
                current = []
            started = True
        if started:
            current.append(line)

    if current:
        blocks.append(current)

    return blocks


def _parse_sections(lines: List[str]) -> Dict[str, str]:
    sections: Dict[str, str] = {}
    i = 0
    while i < len(lines):
        m = _H2_RE.match(lines[i].lstrip())
        if not m:
            i += 1
            continue

        name = m.group(1).strip()
        i += 1
        buf: List[str] = []
        while i < len(lines):
            line = lines[i]
            if line.startswith("# "):
                break
            if _H2_RE.match(line.lstrip()):
                break
            buf.append(line)
            i += 1

        sections[name] = "\n".join(buf).strip("\n")

    return sections


def _extract_fenced_code(text: str) -> str:
    lines = text.splitlines()
    start = None
    for idx, line in enumerate(lines):
        if line.strip().startswith("```"):
            start = idx
            break

    if start is None:
        code = text.strip("\n")
        if not code.strip():
            raise StructuredMarkdownParseError("sampleAnswer is empty")
        return code.rstrip() + "\n"

    code_lines: List[str] = []
    for j in range(start + 1, len(lines)):
        if lines[j].strip().startswith("```"):
            return "\n".join(code_lines).rstrip() + "\n"
        code_lines.append(lines[j])

    raise StructuredMarkdownParseError("unterminated fenced code block in sampleAnswer")


def _parse_testcases_section(text: str) -> List[GeneratedTestCase]:
    cases: List[GeneratedTestCase] = []

    for m in _INLINE_CODE_RE.finditer(text):
        candidate = m.group(1).strip()
        if not (candidate.startswith("{") and candidate.endswith("}")):
            continue
        obj = parse_testcase_json_line(candidate)
        cases.append(GeneratedTestCase(**obj))

    if not cases:
        for line in text.splitlines():
            s = line.strip()
            if not s:
                continue
            if s.startswith("{") and s.endswith("}"):
                obj = parse_testcase_json_line(s)
                cases.append(GeneratedTestCase(**obj))

    if not cases:
        raise StructuredMarkdownParseError("no testcases found")

    return cases


def parse_structured_markdown(md: str, category: str = "syntax", default_language: str = "python3") -> List[GeneratedProblem]:
    blocks = _split_problem_blocks(md)
    if not blocks:
        raise StructuredMarkdownParseError("no problem blocks found")

    problems: List[GeneratedProblem] = []
    for block in blocks:
        sections = _parse_sections(block)

        title = (sections.get("title") or "").strip()
        content_md = (sections.get("content_markdown") or sections.get("contentMarkdown") or "").strip()
        sysin_format = _strip_wrapping_backticks((sections.get("sysinFormat") or "").strip())
        sample_code = _extract_fenced_code(sections.get("sampleAnswer") or sections.get("sampleCode") or "")
        testcases = _parse_testcases_section(sections.get("testcases") or "")

        if not title:
            raise StructuredMarkdownParseError("missing title")
        if not content_md:
            raise StructuredMarkdownParseError("missing content_markdown")
        if not sysin_format:
            raise StructuredMarkdownParseError("missing sysinFormat")
        if not sample_code.strip():
            raise StructuredMarkdownParseError("missing sampleAnswer")

        problem = GeneratedProblem(
            title=title,
            category=category,
            contentMarkdown=content_md,
            sysinFormat=sysin_format,
            defaultLanguage=default_language,
            sampleAnswer=sample_code,
            testcases=testcases,
        )
        validate_problem_is_jsonable(problem)
        problems.append(problem)

    return problems
