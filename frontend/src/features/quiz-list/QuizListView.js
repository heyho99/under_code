export const QuizListView = {
  key: "quiz-list",
  title: "クイズに挑戦する",
  subtitle: "作成済みのクイズセットから選択し、クイズに挑戦します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-list"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <section class="card card--quiz-list">
        <header class="card__header">
          <h2 class="card__title">クイズセット一覧</h2>
        </header>
        <div class="card__body card__body--list">
          <ul class="list list--quiz-set" data-quiz-set-list>
          </ul>
        </div>
      </section>
    `;
  },
};
