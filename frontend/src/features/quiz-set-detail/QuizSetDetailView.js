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
          <div class="quiz-grid" data-quiz-problem-list>
          </div>
          <div class="quiz-set-detail__footer">
            <button class="primary-btn primary-btn--outline js-back-to-quiz-set-list">クイズセット一覧に戻る</button>
          </div>
        </div>
      </section>
    `;
  },
};
