"""
クイズの採点処理を行うモジュール。

ユーザコードの標準出力と、テストケースで定義された期待値を比較して
各ケースの正誤判定を行う。
"""


class Grader:
    @staticmethod
    def judge(user_output, expected_output):
        # ユーザコードの標準出力とテストケースの期待値を比較して正誤判定する
        # 現状は両者を str() で文字列化し、前後の空白・改行を削除したうえで
        # 文字列として完全一致した場合のみ True を返す
        if user_output is None:
            return False

        clean_user = str(user_output).strip()
        clean_expected = str(expected_output).strip()

        return clean_user == clean_expected

