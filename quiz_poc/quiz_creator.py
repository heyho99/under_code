import json
import os


class QuizCreator:
    def __init__(self):
        # 本来はDBから取得するが、ここではハードコーディング
        # quizzes.json からクイズ定義を読み込む
        self.quizzes = self._load_quizzes_from_json()

    def get_quiz(self, quiz_id):
        return self.quizzes.get(quiz_id)

    def get_test_cases(self, quiz_id):
        quiz = self.quizzes.get(quiz_id)
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
                # JSON ではリストだが、元のコードと互換性を保つためにタプルへ変換
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
