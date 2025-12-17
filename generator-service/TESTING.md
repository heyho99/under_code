やること
・apiとかをバンバン変更したので、現状でちゃんと動くか見る（クイズ一覧、プレイ、作成以外）
・README2.mdに従って1つずつ変更し、1つずつ丁寧にテスト
・最初はGenerator

・LLMに渡すプロンプトをちゃんと見る（現状の出力がsetをリストで出力しろという問題になっているが、順番はどっちでも良いと言ってしまっている）
・カテゴリ合算いらない
→プロンプトをちゃんと作成しよう

# generator-service テスト手順

## 1. 前提

- `docker compose` (Compose v2) が使えること
- `generator-service` は `http://localhost:8085` で待ち受けます

## 2. 環境変数（.env）

このプロジェクトでは `generator-service/.env` に環境変数を書く前提です。

例:

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.1
OPENAI_API_BASE=https://api.openai.com/v1
GENERATOR_DEBUG_OUTPUTS=1
GENERATOR_MOCK=0
```

- `OPENAI_API_KEY` を設定すると LLM 実行が可能です
- `GENERATOR_MOCK=1` にすると LLM を呼ばずにモック出力で動作します（APIキー不要）

## 3. 起動

リポジトリルート（`under_code/`）で:

```bash
docker compose up -d --build generator-service
```

## 4. ヘルスチェック

```bash
curl -sS -i http://localhost:8085/health
curl -sS -i http://localhost:8085/generator/health
```

期待値:

- HTTP 200
- ボディが `{"status":"ok"}`

## 5. 生成APIの呼び出し

`generator_payload.json` を使う例:

```bash
curl -sS -i -X POST "http://localhost:8085/generator/generate" \
  -H "Content-Type: application/json" \
  --data-binary "@/home/ouchi/under_code/generator_payload.json"
```

整形して見たい場合（`jq` が不要）:

```bash
curl -sS -X POST "http://localhost:8085/generator/generate" \
  -H "Content-Type: application/json" \
  --data-binary "@/home/ouchi/under_code/generator_payload.json" \
| python3 -m json.tool
```

期待レスポンスの形:

```json
{
  "problems": [
    {
      "title": "...",
      "contentMarkdown": "...",
      "sysinFormat": "...",
      "sampleAnswer": "...",
      "testcases": [
        {"sysin": {}, "expected": {}}
      ]
    }
  ]
}
```

## 6. モック（GENERATOR_MOCK）とは

`GENERATOR_MOCK=1` の場合、LLM API を呼ばずに、アプリ内部に埋め込まれた固定の「構造化 Markdown」を使って `problems` を生成します。

目的:

- LLMキー無しでも Generator のパイプライン（プロンプト生成 → パース → バリデーション → レスポンス）を疎通確認できる
- LLM出力の揺れに依存せず、まず安定したE2E確認ができる

実体:

- `generator-service/app/services/generator.py` の `_MOCK_STRUCTURED_MD` をそのまま使います
- そのためレスポンス内容は固定（テストしやすい）です

設定を変えたら再起動:

```bash
docker compose up -d --build --force-recreate generator-service
```

## 7. デバッグ出力

`GENERATOR_DEBUG_OUTPUTS=1` のとき、以下が更新されます（ホスト側）:

- `generator-service/debug_outputs/latest_llm.md`
- `generator-service/debug_outputs/latest_problems.json`

確認例:

```bash
ls -la ./generator-service/debug_outputs
sed -n '1,160p' ./generator-service/debug_outputs/latest_llm.md
cat ./generator-service/debug_outputs/latest_problems.json | python3 -m json.tool
```

## 8. トラブルシュート

- `{"detail":"OPENAI_API_KEY is not set"}`
  - `.env` に `OPENAI_API_KEY` を設定するか、`GENERATOR_MOCK=1` にしてください
- 502 で `Failed to parse structured Markdown`
  - `debug_outputs/latest_llm.md` を見て、セクション名や testcase JSON 行が仕様通りか確認してください
