# functions_design.md

## 目的
README2.md の新仕様に沿って、BFF / Generator / Executor / Validator に必要な処理を「関数（責務）単位」で列挙する。

## 共通前提（README2.md）
- `stdin` は **JSON文字列**。
- 各言語の starterCode が `stdin` を JSON パースして `sysin` を作る。
- ユーザは `sysin` を使って `result` を作り、**`result` を JSON 文字列として標準出力に1行で出す**。
- 採点は `stdout` の **「最後の非空行」** を JSON パースし、`expected` と `==` で比較する。

---

# BFF

## 公開エンドポイント（Frontend -> BFF）

### クイズ生成
- `post_quiz_creation_generate(req) -> res`
  - **入力**: `title`, `description`, `files[]`, `problemCounts` など
  - **処理**:
    - 入力バリデーション（必須項目、ファイル数上限など）
    - 認証コンテキストから `userId` を取得
    - Generator に生成依頼
    - Quiz-service に保存依頼（quizSet + problems）
  - **出力**: `quizSetId`, `totalProblems` など

### 問題取得（プレイ画面表示）
- `get_problem(problem_id: int, language: str | None) -> res`
  - **処理**:
    - Quiz-service から problem 詳細取得
    - `starterCode` を言語別に付与（DB保存はしない想定）
  - **出力**: problem 情報 + `starterCode`

### 実行（特定 test case で1回だけ実行）
- `post_runner_execute(req) -> res`
  - **入力**: `problemId`, `language`, `code`, `testcaseIndex`
  - **処理**:
    - Quiz-service から `testcases` 取得
    - `testcases[testcaseIndex].sysin` を選択し `stdin=json.dumps(sysin)` を生成
    - Executor-service に `{language, code, stdin}` で実行依頼
  - **出力**: `stdout`, `stderr`, `exitCode`（必要なら time/memory）

### 提出（全 test case を実行して採点）
- `post_submissions(req) -> res`
  - **入力**: `problemId`, `language`, `code`
  - **処理**:
    - 認証コンテキストから `userId` を取得
    - Quiz-service から `testcases` 取得
    - 各 testcase について `stdin=json.dumps(sysin)` を作り Executor-service で実行
    - 実行結果（`stdout/stderr/exitCode`）と `expected` を Validator-service に渡して判定
    - Progress-service に結果保存（`submissions`）
  - **出力**: `isCorrect`, `message`, （任意）`details[]`, `executionResults[]`

## BFF 内部関数（オーケストレーション/ユーティリティ）

### starterCode
- `get_starter_code(language: str) -> str`
  - **処理**: 言語別テンプレを返す（`sysin` 作成 + `result` の JSON 出力まで含む）
  - **備考**: 対応言語外は 400

### Quiz-service 連携
- `fetch_problem(problem_id: int) -> dict`
- `fetch_testcases(problem_id: int) -> list[dict]`
  - **処理**: problem 取得レスポンスから `testcases` を取り出す

### testcase 操作
- `select_testcase(testcases: list[dict], testcase_index: int) -> dict`
- `build_stdin_json(sysin_value: object) -> str`
  - **処理**: `json.dumps(sysin_value)`（必ずJSON化できる前提。失敗時は 500/400）

### Executor-service 連携
- `execute_code_via_executor(language: str, code: str, stdin: str) -> dict`
  - **出力**: `{stdout, stderr, exitCode, ...}`

### Validator-service 連携
- `validate_with_validator(cases: list[dict]) -> dict`
  - **入力例（1ケース）**: `{expected, stdout, stderr, exitCode}`

### Progress-service 連携
- `save_submission(user_id: int, problem_id: int, is_correct: bool) -> None`

### エラーハンドリング
- `map_service_error_to_http(exc) -> (status_code, body)`
- `assert_supported_language(language: str) -> None`

---

# Generator Service

## 公開エンドポイント（BFF -> Generator）
- `post_generate(req) -> res`
  - **入力**: `files[]`（内容）, `problemCounts`（カテゴリ別出題数）など
  - **出力**: `problems[]`（Quiz-service に保存できる形）

## Generator 内部関数（LLM / パース / 正規化）

### プロンプト生成
- `build_generation_prompt(files: list[dict], problem_counts: dict) -> str`
  - **処理**: README2.md の「構造化 Markdown」フォーマットで出させる指示を含める

### LLM 呼び出し
- `call_llm(prompt: str) -> str`
  - **処理**: LLM API 呼び出し（タイムアウト/リトライ/エラー整形）

### 構造化 Markdown -> problems 変換
- `parse_structured_markdown(md: str) -> list[dict]`
  - **処理**: `title/contentMarkdown/sysinFormat/sampleAnswer/testcases` を抽出して list 化
- `parse_testcase_json_line(line: str) -> dict`
  - **処理**: `` `{ "sysin": ..., "expected": ... }` `` のような JSON 行を dict にする

### 正規化/検証
- `normalize_problem(problem: dict) -> dict`
  - **処理**: 必須フィールド欠落の検出、型の整形、余計な空白除去など
- `validate_problem_is_jsonable(problem: dict) -> None`
  - **処理**: `testcases[*].sysin/expected` が JSON で表現可能かチェック

---

# Executor Service

## 公開エンドポイント（BFF -> Executor）
- `post_execute(req) -> res`
  - **入力**: `language`, `code`, `stdin`
  - **処理**: 実行（paiza.io 等）
  - **出力**: `stdout`, `stderr`, `exitCode`（必要なら `time`, `memory`, `result`）

## Executor 内部関数（paiza.io アダプタ）
- `execute(language: str, code: str, stdin: str) -> dict`
  - **処理**: 下記の create/poll/details を束ね、実行結果に正規化して返す

### paiza.io API
- `paiza_create_session(language: str, code: str, stdin: str) -> int`
- `paiza_get_status(session_id: int) -> dict`
- `paiza_get_details(session_id: int) -> dict`
- `paiza_poll_until_completed(session_id: int, timeout_sec: int, interval_sec: float) -> None`

### レスポンス整形
- `map_paiza_details(details: dict) -> dict`
  - **出力**: `{stdout, stderr, exitCode, result, ...}`

---

# Validator Service

## 公開エンドポイント（BFF -> Validator）
- `post_validate(req) -> res`
  - **入力（案）**: `cases: [{expected, stdout, stderr, exitCode}, ...]`
  - **出力（案）**: `isCorrect`, `message`, `details: [{passed, reason, parsedOutput}, ...]`

## Validator 内部関数（JSON出力の解釈と比較）

### stdout から判定対象行を取り出す
- `extract_last_non_empty_line(stdout: str) -> str | None`

### JSONパース
- `parse_json_line(line: str) -> object`
  - **処理**: `json.loads(line)`（失敗時は「出力がJSONでない」扱い）

### 1ケース判定
- `judge_case(expected: object, stdout: str, stderr: str, exit_code: int) -> dict`
  - **処理**:
    - `exit_code != 0` の場合は原則失敗（方針により stderr 優先でメッセージ化）
    - `stdout` 最終非空行を JSON パース
    - `parsed == expected` で判定

### 全ケース集約
- `judge_all(cases: list[dict]) -> dict`
  - **処理**: 全件 `judge_case` し、`all(passed)` を `isCorrect` として返す

### メッセージ生成
- `build_validation_message(details: list[dict]) -> str`
  - **処理**: どのケースで何が違ったか、JSONパースに失敗したか等の要約
