import json
from typing import Any, List, Optional

from app.schemas.validate import ValidateCase, ValidateDetail, ValidateResponse


def extract_last_non_empty_line(stdout: str) -> Optional[str]:
    """stdout の最後の非空行を取り出す"""
    if not stdout:
        return None
    lines = stdout.splitlines()
    for line in reversed(lines):
        stripped = line.strip()
        if stripped:
            return stripped
    return None


def parse_json_line(line: str) -> tuple[bool, Any]:
    """
    JSON 行をパースする。
    戻り値: (成功フラグ, パース結果 or None)
    """
    try:
        return True, json.loads(line)
    except (json.JSONDecodeError, TypeError):
        return False, None


def judge_case(case: ValidateCase) -> ValidateDetail:
    """
    1ケースの判定を行う。
    - exitCode != 0 の場合は失敗
    - stdout 最終非空行を JSON パースし、expected と == で比較
    """
    # exitCode チェック
    if case.exitCode != 0:
        return ValidateDetail(
            testcaseIndex=case.testcaseIndex,
            passed=False,
            reason=f"実行エラー (exitCode={case.exitCode}): {case.stderr or '(stderr なし)'}",
            parsedOutput=None,
        )

    # stdout から最終非空行を取得
    last_line = extract_last_non_empty_line(case.stdout)
    if last_line is None:
        return ValidateDetail(
            testcaseIndex=case.testcaseIndex,
            passed=False,
            reason="出力がありません",
            parsedOutput=None,
        )

    # JSON パース
    success, parsed = parse_json_line(last_line)
    if not success:
        return ValidateDetail(
            testcaseIndex=case.testcaseIndex,
            passed=False,
            reason=f"出力が JSON として解析できません: {last_line[:100]}",
            parsedOutput=None,
        )

    # expected と比較
    if parsed == case.expected:
        return ValidateDetail(
            testcaseIndex=case.testcaseIndex,
            passed=True,
            reason="",
            parsedOutput=parsed,
        )
    else:
        return ValidateDetail(
            testcaseIndex=case.testcaseIndex,
            passed=False,
            reason=f"期待値と一致しません。期待: {json.dumps(case.expected, ensure_ascii=False)}, 実際: {json.dumps(parsed, ensure_ascii=False)}",
            parsedOutput=parsed,
        )


def build_validation_message(details: List[ValidateDetail], is_correct: bool) -> str:
    """判定結果のメッセージを生成する"""
    if is_correct:
        return "全てのテストケースに合格しました"

    failed_cases = [d for d in details if not d.passed]
    if len(failed_cases) == 1:
        return f"テストケース {failed_cases[0].testcaseIndex + 1} が不合格: {failed_cases[0].reason}"
    else:
        failed_indices = [str(d.testcaseIndex + 1) for d in failed_cases]
        return f"テストケース {', '.join(failed_indices)} が不合格"


def judge_all(cases: List[ValidateCase]) -> ValidateResponse:
    """全ケースを判定し、結果を返す"""
    details = [judge_case(case) for case in cases]
    is_correct = all(d.passed for d in details)
    message = build_validation_message(details, is_correct)

    return ValidateResponse(
        isCorrect=is_correct,
        message=message,
        details=details,
    )
