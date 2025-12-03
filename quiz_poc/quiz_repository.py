import json
import os


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

    def _load_quizzes_from_json(self):
        base_dir = os.path.dirname(__file__)
        json_path = os.path.join(base_dir, "quizzes.json")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        quizzes = {}
        for quiz in data.get("quizzes", []):
            quiz_id = quiz.get("id")
            if quiz_id is None:
                continue

            test_cases = []
            for tc in quiz.get("test_cases", []):
                sysin_val = tc.get("sysin")
                # JSON ではリストだが、クイズ側ではタプルとして扱う
                if isinstance(sysin_val, list):
                    sysin_val = tuple(sysin_val)

                test_cases.append(
                    {
                        "sysin": sysin_val,
                        "expected": tc.get("expected"),
                    }
                )

            quiz_dict = dict(quiz)
            quiz_dict["test_cases"] = test_cases
            quizzes[quiz_id] = quiz_dict

        return quizzes
