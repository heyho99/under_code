"""
クイズの採点処理を行うモジュール。

ユーザコードの標準出力と、テストケースで定義された期待値を比較して
各ケースの正誤判定を行う。
"""

import ast
import logging

logger = logging.getLogger(__name__)


class GradingError(Exception):
    """採点処理中のシステム的なエラー（ユーザ出力のパース失敗など）を表す例外。"""


class Grader:
    @staticmethod
    def judge(user_output, expected_output):
        # ユーザコードの標準出力とテストケースの期待値を比較して正誤判定する
        # 期待値が文字列の場合は従来どおり文字列の完全一致で比較し、
        # それ以外の型の場合はユーザ出力を ast.literal_eval で Python オブジェクトに変換して
        # 型ごとの == 比較を行う。パースに失敗した場合は GradingError を送出する。
        if user_output is None:
            return False

        user_str = str(user_output).strip()

        # 期待値が文字列の場合は、ユーザ出力も文字列としてそのまま比較する
        if isinstance(expected_output, str):
            return user_str == expected_output.strip()

        # 期待値が非文字列の場合は、ユーザ出力を Python リテラルとして解釈する
        try:
            parsed = ast.literal_eval(user_str)
        except Exception as e:  # パースできなかった場合はエラーとして扱う
            logger.error(
                "Failed to parse user output as Python literal: %r (expected=%r)",
                user_str,
                expected_output,
            )
            raise GradingError(
                f"出力を Python オブジェクトとして解釈できません: {user_str!r}"
            ) from e

        # set / frozenset は順序に依存しない比較を行う
        if isinstance(expected_output, (set, frozenset)):
            if isinstance(parsed, (set, frozenset)):
                return parsed == expected_output
            if isinstance(parsed, (list, tuple)):
                return set(parsed) == expected_output
            return False

        # dict はキー順に依存しない等価性で比較する
        if isinstance(expected_output, dict):
            return isinstance(parsed, dict) and parsed == expected_output

        # bool は True/False と 1/0 を混同しないよう型もチェックする
        if isinstance(expected_output, bool):
            return isinstance(parsed, bool) and parsed is expected_output

        # 数値は型を合わせた上で比較する（1 と 1.0 を区別したい場合の想定）
        if isinstance(expected_output, (int, float)):
            return type(parsed) is type(expected_output) and parsed == expected_output

        # その他の型については、素直に == で比較する
        return parsed == expected_output
