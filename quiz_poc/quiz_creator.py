class QuizCreator:
    def __init__(self):
        # 本来はDBから取得するが、ここではハードコーディング
        self.quizzes = {
            1: { # id
                "title": "足し算",
                "description": "標準入力からスペース区切りで与えられる2つの整数 A, B の和を出力してください。",
                "test_cases": [
                    ("3 5", "8"), # test case 1
                    ("10 20", "30"), # test case 2
                    ("-1 1", "0"), # test case 3
                ],
            },
        }

    def get_quiz(self, quiz_id):
        return self.quizzes.get(quiz_id)

    def get_test_cases(self, quiz_id):
        quiz = self.quizzes.get(quiz_id)
        return quiz["test_cases"] if quiz else []
