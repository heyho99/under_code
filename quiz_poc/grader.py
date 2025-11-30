class Grader:
    @staticmethod
    def judge(user_output, expected_output):
        # 出力の前後の空白や改行を削除して比較する
        if user_output is None:
            return False

        clean_user = str(user_output).strip()
        clean_expected = str(expected_output).strip()

        return clean_user == clean_expected

