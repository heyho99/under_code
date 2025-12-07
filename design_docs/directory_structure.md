## ディレクトリ構成

### dockerまわり

- 各コンテナはnode, fast apiのwebサーバで通信
    - **Frontend**: node プロセスが :80 でHTTP待機
    - **BFF**: uvicorn プロセスが :8081 でHTTP待機
    - **Services**: uvicorn プロセスが :800X でHTTP待機
- 各サービス配下のDockerfileにイメージの構成を記述する

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
└──  tutor-service/        # [Tutor] AIヒント (v2予定)
```

### フロントエンド

```
frontend/
├─ Dockerfile 
├─ index.html                         # app-shell と <main> / data-view-section="..." を定義
├─ styles.css                         # 全体スタイル（レイアウト + コンポーネント）
├─ styles-wizard.css                  # クイズ作成ウィザード専用スタイル
└─ src/
   ├─ main.js                         # ★ エントリ: 初期化 + router 起動
   │
   ├─ router/                         # ★ ルーティング層（hashchange を扱う唯一の場所）
   │  ├─ routes.js                    # "#/quiz-creation" / "#/dashboard" など → controller の mount/unmount を束ねる
   │  └─ router.js                    # hashchange ハンドラ定義・現在ルートの管理・navigate()
   │
   ├─ core/                           # ★ 全画面共通の基盤
   │  ├─ index.js
   │  └─ api/                         # ★ BFF API へのアクセス層（/api/v1xxx）
   │     ├─ apiClient.js             # 共通クライアント（baseURL, fetch ラッパ, エラーハンドリング）
   │     ├─ authApi.js               # /auth/login, /auth/signup
   │     ├─ dashboardApi.js          # /dashboard/summary, /dashboard/categories, /dashboard/activities
   │     ├─ quizCreationApi.js       # /quiz-creation/upload, /quiz-creation/generate
   │     ├─ quizSetsApi.js           # /quiz-sets, /quiz-sets/{id}
   │     ├─ playApi.js               # /problems/{id}
   │     └─ submissionsApi.js        # /runner/execute, /submissions
   │
   ├─ features/                       # ★ 画面(ドメイン)単位に view / controller / state を束ねる
   │  ├─ login/                       # ログイン画面
   │  │  ├─ LoginView.js
   │  │  └─ LoginController.js       # ← core/api/authApi.js を利用
   │  │
   │  ├─ signup/                      # 新規登録画面
   │  │  ├─ SignupView.js
   │  │  └─ SignupController.js      # ← core/api/authApi.js を利用
   │  │
   │  ├─ quiz-creation/               # クイズ作成ウィザード
   │  │  ├─ QuizCreationView.js
   │  │  └─ QuizCreationController.js # ← core/api/quizCreationApi.js を利用
   │  │
   │  ├─ quiz-progress/               # ダッシュボード（学習状況）
   │  │  ├─ QuizProgressView.js
   │  │  ├─ QuizProgressController.js # ← core/api/dashboardApi.js を利用
   │  │  └─ quizProgressState.js
   │  │
   │  ├─ quiz-list/                   # クイズセット一覧
   │  │  ├─ QuizListView.js
   │  │  └─ QuizListController.js     # ← core/api/quizSetsApi.js を利用
   │  │
   │  ├─ quiz-set-detail/             # セット詳細 + 問題リスト
   │  │  ├─ QuizSetDetailView.js
   │  │  ├─ QuizSetDetailController.js# ← core/api/quizSetsApi.js を利用
   │  │  └─ quizSetDetailState.js
   │  │
   │  └─ quiz-play/                   # クイズ解答画面
   │     ├─ QuizPlayView.js
   │     ├─ QuizPlayController.js     # ← core/api/playApi.js, submissionsApi.js を利用
   │     └─ quizPlayState.js
   │
   └─ ui/                             # 再利用 UI コンポーネント（index.html の構造と対応）
      ├─ Sidebar.js                   # サイドバー開閉 / ナビゲーションイベント
      ├─ MainHeader.js                # タイトル・サブタイトルの書き換え
      └─ components/
         ├─ ActivityChart.js          # 学習履歴バーグラフ（Chart.js）
         └─ CompletionDonut.js        # 全体完了率ドーナツチャート（Chart.js）
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

### User Service (認証・ユーザー管理)

```
user-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints_auth.py
│   │       └── endpoints_users.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── db/
│   │   └── database.py              # 【変更】DB接続/コネクションプール管理 (asyncpgなど)
│   ├── repositories/                # 【新規】SQLを記述し、DBアクセスを行う層
│   │   ├── base_repository.py       # 共通処理
│   │   └── user_repository.py       # SELECT * FROM users WHERE... 等を書く
│   ├── schemas/                     # Pydanticモデル (DBの検索結果をここにマッピングする)
│   │   ├── auth.py
│   │   └── user.py
│   ├── services/                    # ビジネスロジック (Repositoryを呼び出す)
│   │   ├── auth_service.py
│   │   └── user_service.py
│   └── main.py
├── migrations/                      # 【変更】DDL(CREATE TABLE等)のSQLファイルを置く
│   ├── 001_create_users_table.sql
│   └── 002_add_columns.sql
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
│   │       ├── endpoints_quiz_sets.py
│   │       └── endpoints_problems.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   ├── db/
│   │   └── database.py              # DB接続管理
│   ├── repositories/                # 【新規】SQL記述層
│   │   ├── quiz_set_repository.py
│   │   ├── problem_repository.py
│   ├── schemas/                     # Pydanticモデル
│   │   ├── quiz_set.py
│   │   ├── problem.py
│   ├── services/
│   │   ├── quiz_set_service.py
│   │   ├── problem_service.py
│   └── main.py
├── migrations/                      # 【変更】SQLマイグレーションファイル
│   └── 001_create_quiz_tables.sql
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
│   │       ├── endpoints_progress.py
│   │       └── endpoints_submissions.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   ├── db/
│   │   └── database.py              # DB接続管理
│   ├── repositories/                # 【新規】SQL記述層
│   │   ├── progress_repository.py   # 集計クエリ(GROUP BY等)はここに書く
│   │   └── submission_repository.py
│   ├── schemas/
│   │   ├── progress.py
│   │   └── submission.py
│   ├── services/
│   │   └── progress_service.py
│   └── main.py
├── migrations/
│   └── 001_create_progress_tables.sql
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