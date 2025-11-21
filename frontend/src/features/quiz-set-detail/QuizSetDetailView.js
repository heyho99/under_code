export const QuizSetDetailView = {
  key: "quiz-set-detail",
  title: "クイズセット内のクイズを選ぶ",
  subtitle:
    "選択したクイズセットに含まれるクイズの一覧から、挑戦したい問題を選択します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-set-detail"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <section class="card card--quiz-list">
        <header class="card__header">
          <h2 class="card__title">クイズセット内のクイズ</h2>
          <p class="card__subtitle">選択したクイズセットに含まれるクイズから、挑戦するものを選択します</p>
        </header>
        <div class="card__body">
          <div class="quiz-grid">
            <article class="quiz-grid__item">
              <div class="quiz-grid__icon">Q1</div>
              <div class="quiz-grid__body">
                <h3 class="quiz-grid__title">認証フローの責務分離</h3>
                <p class="quiz-grid__meta">Router / Service / Repository の役割を整理する問題です。</p>
              </div>
              <div class="quiz-grid__actions">
                <button class="primary-btn js-open-quiz-play">挑戦する</button>
              </div>
            </article>
            <article class="quiz-grid__item">
              <div class="quiz-grid__icon">Q2</div>
              <div class="quiz-grid__body">
                <h3 class="quiz-grid__title">非同期処理とDBセッション</h3>
                <p class="quiz-grid__meta">async / await とセッションスコープに関する問題です。</p>
              </div>
              <div class="quiz-grid__actions">
                <button class="primary-btn primary-btn--outline js-open-quiz-play">挑戦する</button>
              </div>
            </article>
          </div>
          <div class="quiz-set-detail__footer">
            <button class="primary-btn primary-btn--outline js-back-to-quiz-set-list">クイズセット一覧に戻る</button>
          </div>
        </div>
      </section>
    `;
  },
};
