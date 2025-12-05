"""
quizzes.json からクイズ定義を読み込み、Python オブジェクトとして扱いやすい形に変換するリポジトリモジュール
リポジトリとは、データ保管場所にアクセスするクライアントを指す
"""

import json
import os
import ast


# JSON 内に repr 形式で保存されている値を Python オブジェクトに戻すヘルパー関数
def _from_repr_or_raw(value):
    if not isinstance(value, str):
        return value
    try:
        return ast.literal_eval(value)
    except Exception:
        return value


class QuizRepository:
    """クイズを外部ストレージ（ここでは quizzes.json）から取得するリポジトリ。

    本番では DB から id 指定で 1 件のクイズを取得する想定で、
    POC では quizzes.json から同様の形で読み込む。
    """

    def __init__(self):
        self._quiz_by_id = self._load_quizzes_from_json()

    def get_quiz(self, quiz_id):
        """指定された ID のクイズ 1 件を返す。存在しなければ None。"""
        return self._quiz_by_id.get(quiz_id)

    def get_test_cases(self, quiz_id):
        quiz = self.get_quiz(quiz_id)
        return quiz["test_cases"] if quiz else []

    def get_all_quizzes(self):
        return sorted(self._quiz_by_id.values(), key=lambda q: q.get("id"))

    # quizzes.json を読み込み、内部で扱いやすい dict 形式に変換する
    def _load_quizzes_from_json(self):
        base_dir = os.path.join(os.path.dirname(__file__), "data")
        json_path = os.path.join(base_dir, "quizzes.json")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        quizzes = {}
        for quiz in data.get("quizzes", []):
            quiz_id = quiz.get("id")
            if quiz_id is None:
                continue

            title = _from_repr_or_raw(quiz.get("title"))
            description = _from_repr_or_raw(quiz.get("description"))
            sysin_format = _from_repr_or_raw(quiz.get("sysin_format"))
            sample_code = _from_repr_or_raw(quiz.get("sample_code"))

            raw_testcases = quiz.get("testcases", quiz.get("test_cases", []))

            test_cases = []
            for tc in raw_testcases or []:
                sysin_val = _from_repr_or_raw(tc.get("sysin"))
                expected_val = _from_repr_or_raw(tc.get("expected"))
                # JSON ではリストだが、クイズ側ではタプルとして扱う
                if isinstance(sysin_val, list):
                    sysin_val = tuple(sysin_val)

                test_cases.append(
                    {
                        "sysin": sysin_val,
                        "expected": expected_val,
                    }
                )

            quizzes[quiz_id] = {
                "id": quiz_id,
                "title": title,
                "description": description,
                "sysin_format": sysin_format,
                "sample_code": sample_code,
                "test_cases": test_cases,
            }

        return quizzes
