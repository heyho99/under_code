# under_code

自分のソースコードを読み込ませると、LLM がそのコードを題材にしたコーディングクイズを自動生成し、ブラウザ上で解いて自動採点まで行える学習アプリです。

- ソースコードをアップロード → LLM が問題セット（title / statement / testcases / 模範解答）を生成
- ブラウザのエディタ（CodeMirror）でコードを書き、paiza.io 上で実行
- 標準出力の最終行を JSON としてパースし、`expected` と比較して自動採点
- 解答履歴を蓄積し、ダッシュボードで言語別・カテゴリ別の進捗を表示
- 対応言語: Python / JavaScript / Go

## アーキテクチャ

Frontend → BFF → 各マイクロサービス、という構成です（Docker Compose でまとめて起動）。

```
Client ─ frontend ─ bff ─┬─ user-service     ── user-db      (users)
                         ├─ quiz-service     ── quiz-db      (quiz_sets, problems)
                         ├─ progress-service ── progress-db  (submissions)
                         ├─ generator-service  (OpenAI API でクイズ生成)
                         ├─ executor-service   (paiza.io API でコード実行)
                         └─ validator-service  (出力の正誤判定)
```

- データ管理系サービス（user / quiz / progress）はそれぞれ専用の PostgreSQL を持ちます。
- 機能提供系サービス（generator / executor / validator）は DB を持たないステートレスなサービスです。
- tutor-service（AI ヒント）は v2 予定で、現在は docker-compose 上でコメントアウトされています。

| サービス | ホストポート | 技術 |
| --- | --- | --- |
| frontend | 8080 | Vite + Vanilla JS（hash ルーティング） |
| bff | 8081 | FastAPI |
| user-service | 8082 | FastAPI + asyncpg |
| quiz-service | 8083 | FastAPI + asyncpg |
| progress-service | 8084 | FastAPI + asyncpg |
| generator-service | 8085 | FastAPI + OpenAI API |
| executor-service | 8086 | FastAPI + paiza.io API |
| validator-service | 8087 | FastAPI |
| user-db / quiz-db / progress-db | 5501 / 5502 / 5503 | PostgreSQL 15 |

詳細な設計は `design_docs/` を参照してください。

- `design_docs/service-architecture.md` — サービス構成図
- `design_docs/directory_structure.md` — ディレクトリ構成
- `design_docs/api.md` — BFF / Service の API 仕様
- `design_docs/quiz_logic.md` — 生成・実行・判定のロジックと設計判断
- `design_docs/er-diagram.md` — DB スキーマ
- `design_docs/quiz_functions_design.md` — 問題タイプの設計

## セットアップ

### 前提

- Docker / Docker Compose
- OpenAI API キー（クイズ生成に必要）

### 1. generator-service の環境変数を用意

`generator-service/.env` を作成します（`.env` は Git 管理外）。

```dotenv
OPENAI_API_KEY=sk-...
# 以下は任意（デフォルト値）
OPENAI_MODEL=gpt-5.1
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_REASONING_EFFORT=none
OPENAI_TEXT_VERBOSITY=medium
```

LLM を呼ばずに動作確認したい場合は `GENERATOR_MOCK=1` を設定するとモックレスポンスを返します。

### 2. 起動

```bash
docker compose up -d
```

DB のマイグレーション（`*/migrations/*.sql`）は初回起動時に `docker-entrypoint-initdb.d` 経由で自動適用されます。

ブラウザで http://localhost:8080 を開きます。BFF の OpenAPI ドキュメントは http://localhost:8081/docs です。

### 3. 停止

```bash
docker compose down          # コンテナのみ削除
docker compose down -v       # DB のデータも削除（マイグレーションをやり直す場合）
```

## 使い方

1. `#/signup` からユーザ登録（以降は JWT で認証。`userId = 0` のユーザは admin で全件閲覧可）
2. `#/quiz-creation` でソースコードファイルを選び、問題数を指定して生成を実行
3. `#/quiz-set-list` → `#/problem-list` から問題を選択
4. `#/quiz-play` でコードを書いて「実行」→「提出」。判定結果と履歴が記録される
5. `#/dashboard` で進捗（言語別・カテゴリ別の取り組み数 / 正解数）を確認

## クイズの生成と判定の仕組み

**生成**: generator-service が構造化 Markdown（`## title` / `## statement` / `## sampleCode` / `## testcases` …）を LLM に出力させ、`structured_markdown_parser.py` でパースして問題オブジェクトに変換します。プロンプトは `app/services/prompt_builder.py` で組み立てます。

**実行**: executor-service が paiza.io API にコードと stdin を投げ、セッションが完了するまでポーリングして stdout / stderr / exitCode を返します。

**判定**: validator-service が
1. `exitCode != 0` なら失敗
2. stdout の最終非空行を JSON としてパース
3. `expected`（JSONB で保持）と `==` で比較

という順で採点します。JSON を経由するのは、言語をまたいで標準ライブラリだけで表現・比較できる形式に揃えるためです（`design_docs/quiz_logic.md` に他案との比較あり）。そのため解答コードは **結果を JSON にダンプして標準出力する** 必要があります。

## 開発

各サービスは `Dockerfile.dev` + ボリュームマウント + `--reload` で動くため、ホスト側でファイルを編集すればそのまま反映されます。frontend も Vite の dev server なので HMR が効きます。

```bash
# ログを見る
docker compose logs -f bff

# DB に入る
docker compose exec quiz-db psql -U user -d quiz_db
docker compose exec user-db psql -U user -d user_db
docker compose exec progress-db psql -U user -d progress_db

# generator-service のテスト
docker compose exec generator-service python test_prompt_generation.py
docker compose exec generator-service python test_multi_lang_mock.py
```

`GENERATOR_DEBUG_OUTPUTS=1`（docker-compose でデフォルト有効）のとき、LLM への入出力が `generator-service/debug_outputs/` に保存されます。

## 今後の予定

`TODO.txt` に残タスクをまとめています。主なもの:

- 問題ごとに「このコードがソースファイル内でどんな意味を持つか」の解説を表示
- 生成時に 1 問ずつ validate し、失敗したらエラーを LLM に返して再生成（`is_validated` カラムの追加、失敗分の削除 / 再検証 UI）
- Google 認証の導入
- 有料プランの設定
