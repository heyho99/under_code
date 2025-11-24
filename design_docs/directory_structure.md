## ディレクトリ構造

### ルートディレクトリ構造

```
root/
├── design_docs/          # 設計ドキュメント (既存)
├── frontend/             # フロントエンドアプリケーション
├── bff/                  # Backend For Frontend (API Gateway的な役割)
├── user-service/         # [User] 認証・ユーザー管理
├── quiz-service/         # [Quiz] クイズカタログ・問題管理
├── progress-service/     # [Progress] 学習履歴・進捗管理
├── generator-service/    # [Generator] LLMによる生成
├── executor-service/     # [Executor] コード実行環境
├── validator-service/    # [Validator] コード正誤判定
├── tutor-service/        # [Tutor] AIヒント (v2予定)
└── infra/                # インフラストラクチャ定義 (Docker Compose等)

```

### BFF (Backend For Frontend)

- **役割**: フロントエンド向けAPIの集約、マイクロサービス間のオーケストレーション

```
bff/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_auth.py          # /api/auth/login, /api/auth/signup
│   │       ├── endpoints_dashboard.py     # /api/dashboard/*
│   │       ├── endpoints_quiz_creation.py # /api/quiz-creation/*
│   │       ├── endpoints_quiz_sets.py     # /api/quiz-sets/*
│   │       ├── endpoints_play.py          # /api/problems/*
│   │       └── endpoints_submissions.py   # /api/submissions, /api/runner/execute など
│   ├── core/
│   │   ├── config.py                       # バックエンド各サービスのURL、タイムアウト設定
│   │   ├── logging.py                      # ログ設定
│   │   └── security.py                     # JWT検証など（フロントからのトークンを検証）
│   ├── clients/                           # 各マイクロサービスへのHTTPクライアント
│   │   ├── user_client.py                 # User Service (/user/*)
│   │   ├── quiz_client.py                 # Quiz Service (/quiz/*)
│   │   ├── progress_client.py             # Progress Service (/progress/*)
│   │   ├── generator_client.py            # Generator Service (/generator/*)
│   │   ├── executor_client.py             # Executor Service (/executor/*)
│   │   ├── validator_client.py            # Validator Service (/validator/*)
│   │   └── tutor_client.py                # Tutor Service (/tutor/*, v2)
│   ├── schemas/                           # BFF視点の Request/Response スキーマ
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── quiz_creation.py
│   │   ├── quiz_sets.py
│   │   ├── problems.py
│   │   └── submissions.py
│   └── main.py                             # FastAPI アプリ定義 / エントリーポイント
├── tests/
├── requirements.txt
└── Dockerfile

```

### Backend Services (User, Quiz, Progress)

- **Tech**: 各サービスとも Python (FastAPI) + SQLAlchemy + Alembic
- **構成パターン**: `app/core`, `app/api/v1`, `app/db`, `app/schemas`, `app/services` を共通化しつつ、サービスごとに独立したディレクトリを持つ

### User Service (認証・ユーザー管理)

```
user-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_auth.py        # /user/users/login, /user/users/signup
│   │       └── endpoints_users.py       # ユーザー情報取得・更新
│   ├── core/
│   │   ├── config.py                    # DB URL / JWT 秘密鍵など
│   │   ├── logging.py
│   │   └── security.py                  # パスワードハッシュ / トークン検証
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models/
│   │       └── user.py                  # users テーブル (er-diagram.md に対応)
│   ├── schemas/
│   │   ├── auth.py
│   │   └── user.py
│   ├── services/
│   │   ├── auth_service.py
│   │   └── user_service.py
│   └── main.py                          # FastAPI アプリ定義
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
├── requirements.txt
└── Dockerfile

```

### Quiz Service (クイズカタログ・問題管理)

```
quiz-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_quiz_sets.py   # /quiz/quiz-sets, /quiz/quiz-sets/{id}
│   │       ├── endpoints_problems.py    # /quiz/problems/{id}
│   │       └── endpoints_source_data.py # /quiz/source-data, /quiz/source-data/{id}/analysis
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models/
│   │       ├── quiz_set.py              # quiz_sets
│   │       ├── problem.py               # problems
│   │       └── quiz_source_data.py      # quiz_source_data
│   ├── schemas/
│   │   ├── quiz_set.py
│   │   ├── problem.py
│   │   └── quiz_source_data.py
│   ├── services/
│   │   ├── quiz_set_service.py
│   │   ├── problem_service.py
│   │   └── source_data_service.py
│   └── main.py
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
├── requirements.txt
└── Dockerfile

```

### Progress Service (学習履歴・進捗管理)

```
progress-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_progress.py    # /progress/stats/*, /progress/activities など
│   │       └── endpoints_submissions.py # /progress/submissions 等
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models/
│   │       └── submission.py            # submissions テーブル
│   ├── schemas/
│   │   ├── progress.py                  # ダッシュボード統計用
│   │   └── submission.py                # 提出履歴スキーマ
│   ├── services/
│   │   └── progress_service.py          # 統計計算・履歴保存ロジック
│   └── main.py
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
├── requirements.txt
└── Dockerfile

```

### Generator Service

- **役割**: LLM APIとの通信、プロンプト生成・再構成、回答説明文の作成

```
generator-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_generate.py   # クイズ生成 / 解説生成エンドポイント
│   │       └── endpoints_tutor.py      # ヒント生成エンドポイント (Tutor Service)
│   ├── core/
│   │   ├── config.py                   # LLMプロバイダのキー/エンドポイント設定
│   │   ├── logging.py
│   │   └── security.py                 # 必要に応じて署名検証など
│   ├── schemas/                        # Request/Response スキーマ
│   │   ├── generator.py
│   │   └── tutor.py
│   ├── services/
│   │   ├── prompt_builder.py           # プロンプト組み立てロジック
│   │   └── generator.py                # LLM呼び出し・ポストプロセス
│   ├── clients/
│   │   └── llm_client.py               # OpenAI / Azure などへのクライアント
│   └── main.py                         # FastAPI アプリ定義
├── prompts/                            # プロンプトテンプレート(JSON/Markdown)
├── tests/
├── requirements.txt
└── Dockerfile

```

### Executor Service

```
executor-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints_execute.py    # コード実行リクエスト受付
│   ├── core/
│   │   ├── config.py                   # 実行タイムアウト、許可言語など
│   │   ├── logging.py
│   │   └── security.py
│   ├── runner/                         # 実行環境制御ロジック
│   │   ├── docker_runner.py            # Docker コンテナ起動・停止
│   │   └── sandbox.py                  # サンドボックス制御
│   ├── schemas/                        # Request/Response スキーマ（実行結果）
│   └── main.py                         # FastAPI アプリ定義
├── templates/                          # 言語別実行テンプレート (Dockerfile/スクリプト)
├── tests/
├── requirements.txt
└── Dockerfile

```

### Validator Service

```
validator-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints_validate.py   # 採点リクエスト受付
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── runner/                         # （必要なら）Executor と共有できる実行基盤ラッパ
│   ├── evaluator/                      # 採点・判定ロジック
│   │   ├── test_runner.py
│   │   └── scoring.py
│   ├── schemas/                        # Request/Response スキーマ（採点結果）
│   └── main.py                         # FastAPI アプリ定義
├── tests/
├── requirements.txt
└── Dockerfile

```

---

### インフラ (infra)

ローカル開発環境を一括で立ち上げるための設定を管理します。