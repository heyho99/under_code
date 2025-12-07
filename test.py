import json
from pathlib import Path

import requests

# 1. ソースコードを読み込む
source_path = Path("quiz_poc/backend/data/test_py_code.py")
source_code = source_path.read_text(encoding="utf-8")

# 2. generator-service に送るペイロードを組み立てる
payload = {
    "userId": 1,
    "title": "PoC Test",
    "description": "from test_py_code.py",
    "files": [
        {
            "fileName": "test_py_code.py",
            "content": source_code,
            "problemCounts": {"syntax": 5},  # 適当な値でOK（プロンプトのヒント用）
        }
    ],
}

# 3. /api/v1/generate に POST
url = "http://localhost:8085/api/v1/generate"
resp = requests.post(url, json=payload)

print("status:", resp.status_code)
print("body:")
print(json.dumps(resp.json(), ensure_ascii=False, indent=2))