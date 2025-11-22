export const QuizCreationView = {
  key: "quiz-creation",
  title: "クイズを作成する",
  subtitle:
    "プロジェクトの読み込みからクイズ生成、一覧からの挑戦までを一画面で行います。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-creation"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="wizard-container">
        <nav class="wizard-sidebar">
          <div class="wizard-step-item wizard-step-item--active" data-step-target="1">
            <span class="wizard-step-number">1</span>
            <span class="wizard-step-label">プロジェクト読み込み</span>
          </div>
          <div class="wizard-step-item" data-step-target="2">
            <span class="wizard-step-number">2</span>
            <span class="wizard-step-label">解析範囲の選択</span>
          </div>
          <div class="wizard-step-item" data-step-target="3">
            <span class="wizard-step-number">3</span>
            <span class="wizard-step-label">クイズ詳細設定</span>
          </div>
          <div class="wizard-step-item" data-step-target="4">
            <span class="wizard-step-number">4</span>
            <span class="wizard-step-label">確認・作成</span>
          </div>
        </nav>

        <div class="wizard-main">
          <!-- STEP 1 -->
          <div class="step step--active" data-step="1">
            <div class="step-content-centered">
              <section class="upload-hero">
                <div class="upload-hero__icon-box">
                  <span class="material-symbols-outlined">folder_data</span>
                </div>
                <h2 class="upload-hero__title">プロジェクトを読み込む</h2>
                <p class="upload-hero__subtitle">
                  解析対象となるソースコードのフォルダ、<br />または単一ファイルを登録してください。
                </p>
                
                <div class="dropzone dropzone--large">
                  <div class="dropzone__icon">
                    <span class="material-symbols-outlined">cloud_upload</span>
                  </div>
                  <div class="dropzone__content">
                    <div class="dropzone__hint-main">ここにフォルダをドラッグ＆ドロップ</div>
                    <div class="dropzone__hint-sub">または</div>
                    <button class="primary-btn primary-btn--outline">参照して選択...</button>
                  </div>
                </div>
              </section>
            </div>
            <div class="step-actions">
              <button class="primary-btn js-step-next" data-next-step="2">次へ</button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="step" data-step="2">
            <div class="layout-grid layout-grid--tree-view">
              <section class="card card--tree">
                <header class="card__header">
                  <h2 class="card__title">
                    <span class="material-symbols-outlined card__title-icon">account_tree</span>
                    プロジェクトツリー
                  </h2>
                  <p class="card__subtitle">解析・出題の対象とする範囲を選択してください。</p>
                </header>
                <div class="card__body card__body--no-padding">
                  <div class="tree-container">
                    <ul class="tree">
                      <li class="tree-node tree-node--folder tree-node--collapsed">
                        <div class="tree-node__row js-tree-folder" data-node-key="app">
                          <span class="tree-node__twist material-symbols-outlined">arrow_right</span>
                          <span class="tree-node__type-icon material-symbols-outlined">folder</span>
                          <input
                            type="checkbox"
                            class="tree-node__checkbox"
                            data-node-checkbox="app"
                          />
                          <span class="tree-node__label">app</span>
                        </div>
                        <ul class="tree-node__children">
                          <li class="tree-node tree-node--folder tree-node--collapsed">
                            <div class="tree-node__row js-tree-folder" data-node-key="app/api">
                              <span class="tree-node__twist material-symbols-outlined">arrow_right</span>
                              <span class="tree-node__type-icon material-symbols-outlined">folder</span>
                              <input
                                type="checkbox"
                                class="tree-node__checkbox"
                                data-node-checkbox="app/api"
                              />
                              <span class="tree-node__label">api</span>
                            </div>
                            <ul class="tree-node__children">
                              <li class="tree-node">
                                <div class="tree-node__row" data-node-key="app/api/router.py">
                                  <span class="tree-node__indent"></span>
                                  <span class="tree-node__type-icon material-symbols-outlined">description</span>
                                  <input
                                    type="checkbox"
                                    class="tree-node__checkbox"
                                    data-node-checkbox="app/api/router.py"
                                  />
                                  <span class="tree-node__label">router.py</span>
                                </div>
                              </li>
                            </ul>
                          </li>
                          <li class="tree-node tree-node--folder tree-node--collapsed">
                            <div class="tree-node__row js-tree-folder" data-node-key="app/services">
                              <span class="tree-node__twist material-symbols-outlined">arrow_right</span>
                              <span class="tree-node__type-icon material-symbols-outlined">folder</span>
                              <input
                                type="checkbox"
                                class="tree-node__checkbox"
                                data-node-checkbox="app/services"
                              />
                              <span class="tree-node__label">services</span>
                            </div>
                            <ul class="tree-node__children">
                              <li class="tree-node">
                                <div class="tree-node__row" data-node-key="app/services/service.py">
                                  <span class="tree-node__indent"></span>
                                  <span class="tree-node__type-icon material-symbols-outlined">description</span>
                                  <input
                                    type="checkbox"
                                    class="tree-node__checkbox"
                                    data-node-checkbox="app/services/service.py"
                                  />
                                  <span class="tree-node__label">service.py</span>
                                </div>
                              </li>
                            </ul>
                          </li>
                          <li class="tree-node">
                            <div class="tree-node__row" data-node-key="app/main.py">
                              <span class="tree-node__indent"></span>
                              <span class="tree-node__type-icon material-symbols-outlined">description</span>
                              <input
                                type="checkbox"
                                class="tree-node__checkbox"
                                data-node-checkbox="app/main.py"
                              />
                              <span class="tree-node__label">main.py</span>
                            </div>
                          </li>
                        </ul>
                      </li>
                      <li class="tree-node tree-node--folder tree-node--collapsed">
                        <div class="tree-node__row js-tree-folder" data-node-key="tests">
                          <span class="tree-node__twist material-symbols-outlined">arrow_right</span>
                          <span class="tree-node__type-icon material-symbols-outlined">folder</span>
                          <input
                            type="checkbox"
                            class="tree-node__checkbox"
                            data-node-checkbox="tests"
                          />
                          <span class="tree-node__label">tests</span>
                        </div>
                        <ul class="tree-node__children">
                          <li class="tree-node">
                            <div class="tree-node__row" data-node-key="tests/test_auth.py">
                              <span class="tree-node__indent"></span>
                              <span class="tree-node__type-icon material-symbols-outlined">description</span>
                              <input
                                type="checkbox"
                                class="tree-node__checkbox"
                                data-node-checkbox="tests/test_auth.py"
                              />
                              <span class="tree-node__label">test_auth.py</span>
                            </div>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <aside class="summary-card">
                <div class="summary-card__header">
                  <span class="material-symbols-outlined summary-card__icon">info</span>
                  <h3 class="summary-card__title">選択項目の詳細</h3>
                </div>
                <div class="summary-panel">
                  <div class="summary-panel__label" data-summary-title>app/</div>
                  <p class="summary-panel__text" data-summary-body>
                    アプリケーション本体のコードが入るルートフォルダの想定です。ここからルーティングやサービス層が構成されます。
                  </p>
                </div>
              </aside>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="1">戻る</button>
              <button class="primary-btn js-step-next" data-next-step="3">次へ</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div class="step" data-step="3">
            <div class="layout-grid">
              <section class="card">
                <header class="card__header">
                  <h2 class="card__title">クイズ作成方針</h2>
                  <p class="card__subtitle">クイズタイプごとに出題数を設定し、重点的に学習したい分野を調整します。</p>
                </header>
                <div class="card__body">
                  <div class="quiz-settings-list">
                    <!-- 基本文法 -->
                    <div class="quiz-setting-item quiz-type-row" data-quiz-type="basic">
                      <div class="quiz-setting-item__icon basic">
                        <span class="material-symbols-outlined">code</span>
                      </div>
                      <div class="quiz-setting-item__info">
                        <div class="quiz-setting-item__name">基本文法</div>
                        <div class="quiz-setting-item__desc">変数、型、制御構文などの基礎的な問題</div>
                      </div>
                      <div class="quiz-setting-item__control">
                        <div class="quiz-counter">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="基本文法を減らす"
                          >
                            <span class="material-symbols-outlined">remove</span>
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="基本文法を増やす"
                          >
                            <span class="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 処理 -->
                    <div class="quiz-setting-item quiz-type-row" data-quiz-type="process">
                      <div class="quiz-setting-item__icon process">
                        <span class="material-symbols-outlined">settings_suggest</span>
                      </div>
                      <div class="quiz-setting-item__info">
                        <div class="quiz-setting-item__name">処理・アルゴリズム</div>
                        <div class="quiz-setting-item__desc">データ操作、ロジックフロー、計算処理など</div>
                      </div>
                      <div class="quiz-setting-item__control">
                        <div class="quiz-counter">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="処理を減らす"
                          >
                            <span class="material-symbols-outlined">remove</span>
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="処理を増やす"
                          >
                            <span class="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 関数 -->
                    <div class="quiz-setting-item quiz-type-row" data-quiz-type="function">
                      <div class="quiz-setting-item__icon function">
                        <span class="material-symbols-outlined">functions</span>
                      </div>
                      <div class="quiz-setting-item__info">
                        <div class="quiz-setting-item__name">関数</div>
                        <div class="quiz-setting-item__desc">引数、戻り値、スコープ、高階関数など</div>
                      </div>
                      <div class="quiz-setting-item__control">
                        <div class="quiz-counter">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="関数を減らす"
                          >
                            <span class="material-symbols-outlined">remove</span>
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="関数を増やす"
                          >
                            <span class="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- クラス・モジュール -->
                    <div class="quiz-setting-item quiz-type-row" data-quiz-type="class-module">
                      <div class="quiz-setting-item__icon class-module">
                        <span class="material-symbols-outlined">view_module</span>
                      </div>
                      <div class="quiz-setting-item__info">
                        <div class="quiz-setting-item__name">クラス・モジュール</div>
                        <div class="quiz-setting-item__desc">OOP、インポート、パッケージ構造など</div>
                      </div>
                      <div class="quiz-setting-item__control">
                        <div class="quiz-counter">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="クラス・モジュールを減らす"
                          >
                            <span class="material-symbols-outlined">remove</span>
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="クラス・モジュールを増やす"
                          >
                            <span class="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="card card--quiz-request">
                <header class="card__header">
                  <h2 class="card__title">
                    <span class="material-symbols-outlined card__title-icon">edit_note</span>
                    その他の要望
                  </h2>
                </header>
                <div class="card__body">
                  <textarea
                    class="quiz-request-textarea"
                    placeholder="例：認証フローを重点的に出題したい、基本文法は少なめにしたい、など具体的な要望があれば入力してください。"
                  ></textarea>
                </div>
              </section>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="2">戻る</button>
              <button class="primary-btn js-step-next" data-next-step="4">確認へ</button>
            </div>
          </div>

          <!-- STEP 4 -->
          <div class="step" data-step="4">
            <div class="layout-grid">
              <section class="card">
                <header class="card__header">
                  <h2 class="card__title">クイズ設定の確認</h2>
                  <p class="card__subtitle">以下の内容でクイズを作成します。よろしければ作成ボタンを押してください。</p>
                </header>
                <div class="card__body">
                  <!-- ヒーローセクション: 合計問題数 -->
                  <div class="confirmation-hero">
                    <div class="confirmation-hero__content">
                      <div class="confirmation-hero__label">作成するクイズの合計</div>
                      <div class="confirmation-hero__value">
                        <span class="confirmation-hero__number" data-total-count>0</span>
                        <span class="confirmation-hero__unit">問</span>
                      </div>
                    </div>
                    <div class="confirmation-hero__icon">
                      <span class="material-symbols-outlined">quiz</span>
                    </div>
                  </div>

                  <div class="confirmation-grid">
                    <!-- 左カラム: 解析対象・要望 -->
                    <div class="confirmation-col">
                      <div class="confirmation-section">
                        <h3 class="confirmation-section__title">
                          <span class="material-symbols-outlined">folder_open</span>
                          解析対象プロジェクト
                        </h3>
                        <div class="confirmation-tree-box">
                          <pre class="project-tree-preview">
app/
├─ api/
│  └─ router.py
├─ services/
│  └─ service.py
└─ main.py

                          </pre>
                        </div>
                      </div>

                      <div class="confirmation-section">
                        <h3 class="confirmation-section__title">
                          <span class="material-symbols-outlined">edit_note</span>
                          作成への要望
                        </h3>
                        <div class="confirmation-request-box" data-summary-request>
                          （入力された要望がここに表示されます）
                        </div>
                      </div>
                    </div>

                    <!-- 右カラム: 問題タイプ内訳 -->
                    <div class="confirmation-col">
                      <div class="confirmation-section">
                        <h3 class="confirmation-section__title">
                          <span class="material-symbols-outlined">category</span>
                          出題タイプ別の内訳
                        </h3>
                        <ul class="confirmation-list">
                          <li class="confirmation-list__item">
                            <div class="confirmation-list__info">
                              <span class="confirmation-list__label">基本文法</span>
                              <span class="confirmation-list__desc">変数、型、制御構文など</span>
                            </div>
                            <span class="confirmation-list__value" data-summary-count="basic">0問</span>
                          </li>
                          <li class="confirmation-list__item">
                            <div class="confirmation-list__info">
                              <span class="confirmation-list__label">処理</span>
                              <span class="confirmation-list__desc">アルゴリズム、データ操作</span>
                            </div>
                            <span class="confirmation-list__value" data-summary-count="process">0問</span>
                          </li>
                          <li class="confirmation-list__item">
                            <div class="confirmation-list__info">
                              <span class="confirmation-list__label">関数</span>
                              <span class="confirmation-list__desc">引数、戻り値、スコープ</span>
                            </div>
                            <span class="confirmation-list__value" data-summary-count="function">0問</span>
                          </li>
                          <li class="confirmation-list__item">
                            <div class="confirmation-list__info">
                              <span class="confirmation-list__label">クラス・モジュール</span>
                              <span class="confirmation-list__desc">OOP、インポート、構造</span>
                            </div>
                            <span class="confirmation-list__value" data-summary-count="class-module">0問</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="3">戻る</button>
              <button class="primary-btn js-generate-quiz">この内容でクイズを作成</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
