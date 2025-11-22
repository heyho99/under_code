frontend/
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
   ├─ core/                           # ★ 全画面共通の基盤（現在はプレースホルダ）
   │  └─ index.js
   │
   ├─ features/                       # ★ 画面(ドメイン)単位に view / controller / state を束ねる
   │  ├─ login/                       # ログイン画面
   │  │  ├─ LoginView.js
   │  │  └─ LoginController.js
   │  │
   │  ├─ signup/                      # 新規登録画面
   │  │  ├─ SignupView.js
   │  │  └─ SignupController.js
   │  │
   │  ├─ quiz-creation/               # クイズ作成ウィザード
   │  │  ├─ QuizCreationView.js
   │  │  └─ QuizCreationController.js
   │  │
   │  ├─ quiz-progress/               # ダッシュボード（学習状況）
   │  │  ├─ QuizProgressView.js
   │  │  ├─ QuizProgressController.js
   │  │  └─ quizProgressState.js
   │  │
   │  ├─ quiz-list/                   # クイズセット一覧
   │  │  ├─ QuizListView.js
   │  │  └─ QuizListController.js
   │  │
   │  ├─ quiz-set-detail/             # セット詳細 + 問題リスト
   │  │  ├─ QuizSetDetailView.js
   │  │  ├─ QuizSetDetailController.js
   │  │  └─ quizSetDetailState.js
   │  │
   │  └─ quiz-play/                   # クイズ解答画面
   │     ├─ QuizPlayView.js
   │     ├─ QuizPlayController.js
   │     └─ quizPlayState.js
   │
   └─ ui/                             # 再利用 UI コンポーネント（index.html の構造と対応）
      ├─ Sidebar.js                   # サイドバー開閉 / ナビゲーションイベント
      ├─ MainHeader.js                # タイトル・サブタイトルの書き換え
      └─ components/
         ├─ ActivityChart.js          # 学習履歴バーグラフ（Chart.js）
         └─ CompletionDonut.js        # 全体完了率ドーナツチャート（Chart.js）