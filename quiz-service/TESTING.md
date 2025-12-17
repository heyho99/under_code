# quiz-service テスト手順

## 1. 前提

- `docker compose` (Compose v2) が使えること
- `quiz-service` は `http://localhost:8083` で待ち受けます
- PostgreSQL (`quiz-db`) が起動していること

## 2. 起動

リポジトリルート（`under_code/`）で:

```bash
docker compose up -d --build quiz-service
```

DBも含めて起動する場合:

```bash
docker compose up -d --build quiz-service quiz-db
```

## 3. ヘルスチェック

```bash
curl -sS -i http://localhost:8083/health
```

期待値:

- HTTP 200
- ボディが `{"status":"ok"}`

## 4. マイグレーション

マイグレーションファイルは `quiz-service/migrations/` にあり、`quiz-db` コンテナの `/docker-entrypoint-initdb.d/` にマウントされています。

### 初回起動時（DBボリュームが空の場合）

PostgreSQL は初回起動時に `/docker-entrypoint-initdb.d/` 内のスクリプトを自動実行します。

### 既存DBにマイグレーションを適用する場合

```bash
docker compose exec quiz-db psql -U user -d quiz_db -f /docker-entrypoint-initdb.d/001_create_quiz_tables.sql
docker compose exec quiz-db psql -U user -d quiz_db -f /docker-entrypoint-initdb.d/002_add_problem_io_fields.sql
```

## 5. エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/quiz/quiz-sets/generate` | クイズセット作成 |
| GET | `/quiz/quiz-sets?userId=N` | クイズセット一覧取得 |
| GET | `/quiz/quiz-sets/{id}` | クイズセット詳細取得 |
| GET | `/quiz/problems/{id}` | 問題詳細取得 |
| GET | `/quiz/quizzes/stats/count?userId=N` | 問題数統計 |
| GET | `/quiz/quizzes/stats/categories?userId=N` | カテゴリ別統計 |

## 6. クイズセット作成

```bash
curl -sS -X POST "http://localhost:8083/quiz/quiz-sets/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "テストクイズセット",
    "description": "テスト用の説明",
    "problems": [
      {
        "title": "テスト問題1",
        "category": "syntax",
        "contentMarkdown": "変数 `sysin` に数値が入っています。その値を2倍にして出力してください。",
        "sysinFormat": "{\"n\": number}",
        "defaultLanguage": "python3",
        "sampleAnswer": "import sys, json\nsysin = json.loads(sys.stdin.read())\nprint(json.dumps(sysin[\"n\"] * 2))\n",
        "testcases": [
          {"sysin": {"n": 5}, "expected": 10},
          {"sysin": {"n": 0}, "expected": 0}
        ]
      }
    ]
  }' | python3 -m json.tool
```

期待レスポンス:

```json
{
  "quizSetId": 1,
  "totalProblems": 1
}
```

## 7. クイズセット一覧取得

```bash
curl -sS "http://localhost:8083/quiz/quiz-sets?userId=1" | python3 -m json.tool
```

期待レスポンス:

```json
[
  {
    "quizSetId": 1,
    "title": "テストクイズセット",
    "description": "テスト用の説明"
  }
]
```

## 8. クイズセット詳細取得

```bash
curl -sS "http://localhost:8083/quiz/quiz-sets/1" | python3 -m json.tool
```

期待レスポンス:

```json
{
  "quizSetId": 1,
  "title": "テストクイズセット",
  "problems": [
    {
      "problemId": 1,
      "title": "テスト問題1",
      "defaultLanguage": "python3"
    }
  ]
}
```

## 9. 問題詳細取得

```bash
curl -sS "http://localhost:8083/quiz/problems/1" | python3 -m json.tool
```

期待レスポンス:

```json
{
  "problemId": 1,
  "quizSetId": 1,
  "orderIndex": 1,
  "title": "テスト問題1",
  "defaultLanguage": "python3",
  "contentMarkdown": "変数 `sysin` に数値が入っています。その値を2倍にして出力してください。",
  "sysinFormat": "{\"n\": number}",
  "sampleAnswer": "import sys, json\nsysin = json.loads(sys.stdin.read())\nprint(json.dumps(sysin[\"n\"] * 2))\n",
  "testcases": [
    {"sysin": {"n": 5}, "expected": 10},
    {"sysin": {"n": 0}, "expected": 0}
  ]
}
```

## 10. 統計エンドポイント

### 問題数統計

```bash
curl -sS "http://localhost:8083/quiz/quizzes/stats/count?userId=1" | python3 -m json.tool
```

期待レスポンス:

```json
{
  "totalProblems": 1
}
```

### カテゴリ別統計

```bash
curl -sS "http://localhost:8083/quiz/quizzes/stats/categories?userId=1" | python3 -m json.tool
```

期待レスポンス:

```json
[
  {
    "category": "syntax",
    "count": 1
  }
]
```

## 11. Generator連携テスト

Generator Service で生成した問題を quiz-service に保存する場合:

```bash
# 1. Generator で問題生成
PROBLEMS=$(curl -sS -X POST "http://localhost:8085/generator/generate" \
  -H "Content-Type: application/json" \
  --data-binary "@/home/ouchi/under_code/generator_payload.json")

# 2. 生成された問題を確認
echo "$PROBLEMS" | python3 -m json.tool

# 3. quiz-service に保存（手動でペイロード作成）
# ※ 実際の運用では BFF がこの連携を行います
```

## 12. トラブルシュート

### DB接続エラー

```
asyncpg.exceptions.ConnectionDoesNotExistError
```

→ `quiz-db` が起動しているか確認:

```bash
docker compose ps quiz-db
docker compose logs quiz-db
```

### テーブルが存在しない

```
relation "quiz_sets" does not exist
```

→ マイグレーションを実行（セクション4参照）

### 404 Not Found

- パスが正しいか確認（`/quiz/...` で始まる）
- `userId` パラメータが必須のエンドポイントで指定しているか確認

### ログ確認

```bash
docker compose logs -f quiz-service
```
