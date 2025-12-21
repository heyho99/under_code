export const QuizPlayView = {
  key: "quiz-play",
  title: "クイズを解く",
  subtitle:
    "選択したクイズの詳細と回答エリアを表示し、Python実行環境で試すことを想定した画面です。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-play"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <section class="quiz-play-card">
        <header class="quiz-play-header">
          <div class="quiz-play-header__main">
            <h2 class="quiz-play-header__title" data-quiz-title>クイズタイトル</h2>
            <span class="quiz-play-header__badge" data-quiz-description>カテゴリ</span>
          </div>
        </header>
        
        <div class="quiz-play-body">
          <div class="quiz-play-statement" data-quiz-markdown>問題の本文がここに表示されます。</div>
          
          <div class="quiz-play-editor">
            <div class="quiz-play-editor__header">
              <div class="quiz-play-editor__tabs">
                <span class="quiz-play-editor__tab quiz-play-editor__tab--active" data-editor-tab>answer.py</span>
              </div>
              <div class="quiz-play-editor__lang" data-editor-footer>
                Python 3.11
              </div>
            </div>
            <div class="quiz-play-editor__body">
              <div class="code-editor-container" data-code-editor></div>
            </div>
          </div>
          <div class="quiz-play-panels">
            <div class="quiz-play-panel quiz-play-panel--testcase">
              <div class="quiz-play-panel__header">
                <div class="quiz-play-panel__title">
                  <span class="material-symbols-outlined">data_object</span>
                  テストケース
                </div>
                <div class="quiz-play-panel__nav">
                  <button class="quiz-play-panel__nav-btn js-testcase-prev">
                    <span class="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span class="quiz-play-panel__nav-label" data-testcase-label>1 / 1</span>
                  <button class="quiz-play-panel__nav-btn js-testcase-next">
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div class="quiz-play-panel__body quiz-play-panel__body--grid">
                <div class="quiz-play-panel__item">
                  <div class="quiz-play-panel__label">入力 (sysin)</div>
                  <pre class="quiz-play-panel__value" data-testcase-sysin>{}</pre>
                </div>
                <div class="quiz-play-panel__item">
                  <div class="quiz-play-panel__label">期待出力 (expected)</div>
                  <pre class="quiz-play-panel__value" data-testcase-expected>{}</pre>
                </div>
              </div>
            </div>

            <div class="quiz-play-panel quiz-play-panel--output">
              <div class="quiz-play-panel__header quiz-play-panel__header--dark">
                <div class="quiz-play-panel__title">
                  <span class="material-symbols-outlined">terminal</span>
                  コンソール出力
                </div>
              </div>
              <pre class="quiz-play-panel__console" data-quiz-output>>> 準備完了</pre>
            </div>
          </div>

          <div class="quiz-feedback" data-quiz-feedback style="display: none;"></div>

          <div class="quiz-play-actions">
            <button class="quiz-play-btn quiz-play-btn--back js-back-to-quiz-list">
              <span class="material-symbols-outlined">arrow_back</span>
              一覧へ
            </button>
            <div class="quiz-play-actions__right">
              <button class="quiz-play-btn quiz-play-btn--ghost js-hint-v2">
                <span class="material-symbols-outlined">lightbulb</span>
                ヒント
              </button>
              <button class="quiz-play-btn quiz-play-btn--ghost js-view-answer">
                <span class="material-symbols-outlined">visibility</span>
                正解
              </button>
              <button class="quiz-play-btn quiz-play-btn--secondary js-run-code">
                <span class="material-symbols-outlined">play_arrow</span>
                実行
              </button>
              <button class="quiz-play-btn quiz-play-btn--primary js-submit-quiz">
                <span class="material-symbols-outlined">check</span>
                提出
              </button>
            </div>
          </div>

          <div class="submit-overlay" data-submit-overlay style="display: none;">
            <div class="submit-overlay__content">
              <div class="submit-spinner"></div>
              <span class="submit-overlay__text">採点中...</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },
};
