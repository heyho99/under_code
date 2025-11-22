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
        </nav>

        <div class="wizard-main">
          <!-- STEP 1 -->
          <div class="step step--active" data-step="1">
            <div class="layout-grid">
              <section class="card">
                <header class="card__header">
                  <h2 class="card__title">プロジェクトを読み込む</h2>
                  <p class="card__subtitle">フォルダまたは単一ファイルを指定して解析対象を登録</p>
                </header>
                <div class="card__body">
                  <div class="dropzone">
                    <div class="dropzone__hint-main">ここにドラッグ＆ドロップ</div>
                    <div class="dropzone__hint-sub">または「参照」から選択</div>
                    <button class="ghost-btn">参照...</button>
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
            <div class="layout-grid">
              <section class="card card--project-tree">
                <header class="card__header">
                  <h2 class="card__title">プロジェクトツリー</h2>
                  <p class="card__subtitle">読み込んだプロジェクトをGUIツリーで確認し、対象範囲を選択</p>
                </header>
                <div class="card__body card__body--stack">
                  <div class="tree-panel">
                    <ul class="tree">
                      <li class="tree-node tree-node--folder tree-node--collapsed">
                        <div class="tree-node__row js-tree-folder" data-node-key="app">
                          <span class="tree-node__twist">▶</span>
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
                              <span class="tree-node__twist">▶</span>
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
                              <span class="tree-node__twist">▶</span>
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
                          <span class="tree-node__twist">▶</span>
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
                  <div class="summary-panel">
                    <div class="summary-panel__label" data-summary-title>app/</div>
                    <p class="summary-panel__text" data-summary-body>
                      アプリケーション本体のコードが入るルートフォルダの想定です。ここからルーティングやサービス層が構成されます。
                    </p>
                  </div>
                </div>
              </section>
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
                  <p class="card__subtitle">クイズタイプごとに出題数を設定</p>
                </header>
                <div class="card__body card__body--stack">
                  <div class="setting-row setting-row--stack">
                    <div class="quiz-type-matrix">
                      <div class="quiz-type-row" data-quiz-type="basic">
                        <div class="quiz-type-row__name">基本文法</div>
                        <div class="quiz-type-row__counts">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="基本文法のクイズ数を10問減らす"
                          >
                            −10
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="基本文法のクイズ数を10問増やす"
                          >
                            ＋10
                          </button>
                        </div>
                      </div>
                      <div class="quiz-type-row" data-quiz-type="process">
                        <div class="quiz-type-row__name">処理</div>
                        <div class="quiz-type-row__counts">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="処理のクイズ数を10問減らす"
                          >
                            −10
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="処理のクイズ数を10問増やす"
                          >
                            ＋10
                          </button>
                        </div>
                      </div>
                      <div class="quiz-type-row" data-quiz-type="function">
                        <div class="quiz-type-row__name">関数</div>
                        <div class="quiz-type-row__counts">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="関数のクイズ数を10問減らす"
                          >
                            −10
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="関数のクイズ数を10問増やす"
                          >
                            ＋10
                          </button>
                        </div>
                      </div>
                      <div class="quiz-type-row" data-quiz-type="class-module">
                        <div class="quiz-type-row__name">クラス・モジュール</div>
                        <div class="quiz-type-row__counts">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="クラス・モジュールのクイズ数を10問減らす"
                          >
                            −10
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="クラス・モジュールのクイズ数を10問増やす"
                          >
                            ＋10
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="card card--quiz-request">
                <header class="card__header">
                  <h2 class="card__title">クイズ作成要望</h2>
                </header>
                <div class="card__body card__body--stack">
                  <textarea
                    class="quiz-request-textarea"
                    placeholder="例：認証フローを重点的に出題したい、基本文法は少なめにしたい、など"
                  ></textarea>
                </div>
              </section>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="2">戻る</button>
              <button class="primary-btn js-generate-quiz">クイズを生成</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
