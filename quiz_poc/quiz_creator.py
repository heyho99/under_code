class QuizCreator:
    def __init__(self):
        # 本来はDBから取得するが、ここではハードコーディング
        self.quizzes = {
            1: {  # id
                "title": "足し算",
                "description": "2つの整数 A, B の和を計算して出力してください。",
                "sysin_format": "sysin は 2つの整数 (A, B) を要素にもつタプルです。例: (3, 5)",
                "test_cases": [
                    {"sysin": (3, 5), "expected": 8},  # test case 1
                    {"sysin": (10, 20), "expected": 30},  # test case 2
                    {"sysin": (-1, 1), "expected": 0},  # test case 3
                ],
            },
        }

    def get_quiz(self, quiz_id):
        return self.quizzes.get(quiz_id)

    def get_test_cases(self, quiz_id):
        quiz = self.quizzes.get(quiz_id)
        return quiz["test_cases"] if quiz else []
