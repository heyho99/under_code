"""
LLM を用いて Python コードからクイズ問題 (quizzes.md) を生成するユーティリティモジュール。

- test_py_code.txt に書かれた対象コードからプロンプトを構築し、
- OpenAI Responses API に投げて quizzes.md 形式のクイズ定義を生成する。
"""

from pathlib import Path
import os

from dotenv import load_dotenv
import requests


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SOURCE_CODE_PATH = DATA_DIR / "test_py_code.txt"
OUTPUT_PATH = DATA_DIR / "quizzes.md"

# backend/.env を読み込んで OPENAI_API_KEY などを環境変数に流し込む
load_dotenv(BASE_DIR / ".env")

PLACEHOLDER = "(ここにクイズの元となるソースコードを入力してください)"


PROMPT_TEMPLATE_MD = '''
# Pythonコード読解・実装クイズ生成プロンプト（レベル1：基本文法・処理）

あなたはPythonのプログラミング教育の専門家です。
後述する【対象コード】を分析し、コード再現クイズを5問作成してください

## クイズ作成ルール
1.  **どのような内容か**: 
    *   対象コードに含まれる基本的な文法や処理を問うクイズ
    *   「関数定義やクラス定義を含まない、数行の処理」を対象とします
    *   コード内の特定の行やブロックを抜き出して問題にします
2.  **実行環境**: 
    *   ユーザーのコード実行時に、システム側から変数 `sysin` が与えられる前提です
    *   各テストケースごとに異なる値が `sysin` に代入されます
3.  **解答コードの形式**:
    *   与えられた `sysin` に対して処理を行い、結果を **標準出力（print）** するコードを正解とします
    *   必要なモジュールは `import` してください

## 出力フォーマット
回答は **5つの独立したコードブロック** に分けて出力してください。
各ブロックの言語指定には連番（例: `python:1`, `python:2`）を付与してください。
各ブロック内で、以下の変数を定義してください。

### 出力例
~~~markdown
```python:1

title = "辞書内包表記による値の加工"
description = """
辞書内包表記を使用して、元の辞書の「値 (value)」をすべて文字列型に変換した新しい辞書を作成し、それを標準出力してください。
"""

sysin_format = "{key: value, ...} （辞書）"

sample_code = """
result = {k: str(v) for k, v in sysin.items()}
print(result)
"""

test_case_1 = {"sysin": {"a": 1, "b": 2}, "expected": {'a': '1', 'b': '2'}}
test_case_2 = {"sysin": {"x": 10.5, "y": True}, "expected": {'x': '10.5', 'y': 'True'}}
test_case_3 = {"sysin": {}, "expected": "{}"}

```

```python:2
"""2問目"""
```

...

```python:n
"""n問目"""
```
~~~

### 1. 出力変数定義
各問題について、以下の変数名でPythonコードとして定義してください。

*   **`title`**:
    *   **説明**: 短く簡潔な問題の表題
    *   **型**: 文字列 (String)

*   **`description`**:
    *   **説明**: ユーザー（解答者）に提示される問題文
    *   **必須要件**:
        1.  **入力**: 変数 `sysin` にデータが渡されることを明記すること
        2.  **処理**: 対象コードのロジックをどのように再現するか指示すること
    *   **型**: 三重引用符で囲まれた文字列 (Multi-line String)

*   **`sysin_format`**:
    *   **説明**: 変数 `sysin` にどのような形式のデータが入ってくるかのヒント
    *   **型**: 文字列 (String)

*   **`sample_code`**:
    *   **説明**: 模範解答となるPythonコード
    *   **型**: 三重引用符で囲まれた文字列 (Multi-line String)

*   **`test_case_1` ~ `test_case_3`**:
    *   **説明**: 自動採点に使用されるテストデータの定義。`test_case_1`, `test_case_2`, `test_case_3` の各変数に辞書を代入します。
    *   **型**: 辞書 (Dictionary)

### 2. テストケース辞書の構造 (`test_case_n` の中身)
`test_case_1` 等の各変数に代入される辞書のキー定義

*   **`sysin`**:
    *   **説明**: 実行時にユーザーのコード内の変数 `sysin` に代入される具体的な値（Pythonオブジェクトそのもの）
    *   **型**: 文字列、数値、リスト、辞書など（Pythonで扱える任意の型）

*   **`expected`**:
    *   **説明**: ユーザーのコードが `print()` した結果として期待される値（Pythonオブジェクト）
    *   **型**: 文字列、数値、リスト、辞書、集合など（Pythonで扱える任意の型）
    *   **注意**: 期待値が文字列の場合は標準出力を文字列として比較し、それ以外の型の場合は標準出力を Python リテラルとして解釈してオブジェクト同士を比較します

## 【対象コード】
```python
(ここにクイズの元となるソースコードを入力してください)
```
'''


def build_prompt(source_code: str) -> str:
    if PLACEHOLDER not in PROMPT_TEMPLATE_MD:
        raise ValueError("placeholder not found in prompt template")
    return PROMPT_TEMPLATE_MD.replace(PLACEHOLDER, source_code)


def call_llm(prompt: str) -> str:
    """OpenAI Responses API を使って GPT-5.1 にプロンプトを投げる。

    openaiapi.md の仕様に合わせて /v1/responses エンドポイントを使用し、
    model/input/reasoning/text を含む payload を送信する。
    """

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    # モデルは gpt-5.1 に固定
    model = "gpt-5.1"
    base_url = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")

    reasoning_effort = os.environ.get("OPENAI_REASONING_EFFORT", "none")   # none/low/medium/high
    text_verbosity = os.environ.get("OPENAI_TEXT_VERBOSITY", "medium")     # low/medium/high

    url = f"{base_url.rstrip('/')}/responses"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "input": prompt,
        "reasoning": {"effort": reasoning_effort},
        "text": {"verbosity": text_verbosity},
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"LLM API request failed: {exc}") from exc

    data = response.json()

    # openaiapi.md にある "output" 構造から output_text を集約する
    texts = []
    for item in data.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str):
                    texts.append(text)

    if not texts:
        raise RuntimeError(f"Unexpected LLM API response (no output_text): {data}")

    return "\n".join(texts)


def generate_quizzes_from_file() -> str:
    source_code = SOURCE_CODE_PATH.read_text(encoding="utf-8")
    prompt = build_prompt(source_code)
    content = call_llm(prompt)
    OUTPUT_PATH.write_text(content, encoding="utf-8")
    return content


if __name__ == "__main__":
    generate_quizzes_from_file()

