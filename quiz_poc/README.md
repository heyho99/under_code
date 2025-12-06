flask --app quiz_poc run --debug


## 処理フロー

1. LLM によるクイズ生成（オフライン前処理）
   - `backend/llm_creator.py` を実行
   - `data/test_py_code.txt` のコードをもとにプロンプトを組み立てて LLM を呼び出し、
   - `data/quizzes.md`（Markdown 形式のクイズ定義）を生成する。

2. Markdown から JSON への変換
   - `backend/extract_quizzes.py` を実行
   - `data/quizzes.md` 内の ```python:n ブロックを走査して各クイズ定義を exec し、
   - `data/quizzes.json`（アプリが読む疑似 DB）を生成する。

3. アプリ起動
   - `flask --app quiz_poc run --debug` で Flask アプリを起動する。
   - 起動時に `QuizRepository` が `data/quizzes.json` を読み込み、クイズ一覧をメモリに載せる。

4. クイズ一覧表示
   - ブラウザで `/` にアクセスすると `backend/__init__.py` の `index` が呼ばれ、
   - `QuizRepository.get_all_quizzes()` の結果を `frontend/quiz_list.html` でレンダリングする。

5. 個別クイズ画面表示
   - `/quiz/<id>` にアクセスすると `show_quiz` が呼ばれ、
   - 指定 ID のクイズを取得して `description` を Markdown → HTML に変換し、
   - `frontend/index.html` を使って問題画面を表示する。

6. 「実行」ボタン（/execute）
   - 画面上のエディタのコードを `backend/executor.py` の `CodeExecutor` に渡し、
   - paiza.io API を通じてコードを実行する。
   - テストケースや `sysin` は使わず、標準入力は常に空文字列。

7. 「提出」ボタン（/run）
   - `QuizRepository` から対象クイズの `test_cases` を取得する。
   - 各テストケースについて:
     - `build_source_with_sysin` で `sysin = <テスト入力>` をコード先頭に埋め込んだソースを生成し、
     - `CodeExecutor.run()` で外部実行して標準出力を取得し、
     - `Grader.judge(stdout, expected)` で期待値と比較して正誤判定する。
   - すべてのテストに通れば AC、それ以外は WA として結果を JSON で返す。


## ディレクトリツリー

quiz_poc/
├─ backend/                     # POC の「サービス側」(将来 generator/quiz/executor に分離)
│  ├─ __init__.py               # Flask アプリ本体 (API 兼 デモ用 HTML 出力)
│  ├─ executor.py               # paiza.io API を叩いてコードを実行するラッパ
│  ├─ grader.py                 # ユーザ出力と期待値を比較して採点するロジック
│  ├─ quiz_repository.py        # quizzes.json を読み込んでクイズオブジェクトを提供
│  ├─ extract_quizzes.py        # quizzes.md から quizzes.json を生成するスクリプト
│  ├─ llm_creator.py            # LLM を使って quizzes.md を生成するユーティリティ
│  ├─ data/
│  │  ├─ quizzes.json           # 疑似 DB（本番では quiz-db のテーブル想定）
│  │  ├─ quizzes.md             # LLM 出力ログ（本番では基本は使わない想定）
│  │  └─ test_py_code.txt       # 対象コード（本番ではBFFが受け取るアップロードファイルに相当）
│  └─ .env                      # API キー等 (必要に応じて)
│
├─ frontend/                    # POC の「画面側」(将来 frontend/ に統合)
│  ├─ index.html                # 問題画面
│  ├─ quiz_list.html            # 一覧画面
│  └─ js/
│     ├─ editor.js
│     └─ run_code.js
│
└─ README.md                    # POC の起動方法・構成など