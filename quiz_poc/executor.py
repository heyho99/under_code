"""
コードを実行して結果を返すモジュール。

- input_value: コンテナ内で標準入力として渡す文字列。
  - 提出時 (/run) にはテストケースの入力がここに渡される。
  - 実行時 (/execute) には常に空文字が渡される。
"""

import time

import requests


BASE_URL = "https://api.paiza.io/runners/"


class CodeExecutor:
    def __init__(self, source_code, language, input_value):
        self.source_code = source_code
        self.language = language
        self.input_value = input_value
        self.api_key = "guest"
        self.session_id = None

    def run(self):
        # 1. Create Session
        try:
            create_res = requests.post(
                BASE_URL + "create",
                params={
                    "source_code": self.source_code,
                    "language": self.language,
                    "input": self.input_value,
                    "api_key": self.api_key,
                },
                timeout=10,
            )
            create_res.raise_for_status()
            create_data = create_res.json()

            self.session_id = create_data.get("id")
            if not self.session_id:
                return {
                    "error": create_data.get("error") or "no session id",
                    "result": "failure",
                }

            # 2. Wait for completion (Polling)
            start = time.time()
            while True:
                status_res = requests.get(
                    BASE_URL + "get_status",
                    params={
                        "id": self.session_id,
                        "api_key": self.api_key,
                    },
                    timeout=10,
                )
                status_res.raise_for_status()
                status_data = status_res.json()

                if status_data.get("status") == "completed":
                    break

                if time.time() - start > 30:
                    return {
                        "error": "timeout waiting for execution",
                        "result": "failure",
                    }

                # APIに負荷をかけないよう1秒待機
                time.sleep(1)

            # 3. Get Details
            details_res = requests.get(
                BASE_URL + "get_details",
                params={
                    "id": self.session_id,
                    "api_key": self.api_key,
                },
                timeout=10,
            )
            details_res.raise_for_status()
            return details_res.json()

        except Exception as e:
            return {"error": str(e), "result": "failure"}

