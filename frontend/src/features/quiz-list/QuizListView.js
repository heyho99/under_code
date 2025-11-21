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
          <ul class="list list--quiz-set">
            <li class="list__item quiz-set-item">
              <div class="list__row quiz-set-item__row">
                <div class="list__primary">
                  <span class="list__title">認証フロー理解セット</span>
                  <span class="list__meta">FastAPI の認証フローを通してレイヤ構造を確認するクイズセット</span>
                </div>
                <div class="list__actions">
                  <button class="primary-btn js-open-quiz-set">クイズを選ぶ</button>
                </div>
              </div>
              <div class="quiz-set-item__meta">
                <span>前回挑戦: 2025/11/01</span>
                <span class="quiz-set-item__meta-separator">・</span>
                <span>正答率: 78%</span>
              </div>
            </li>
            <li class="list__item quiz-set-item">
              <div class="list__row quiz-set-item__row">
                <div class="list__primary">
                  <span class="list__title">非同期処理・DB セット</span>
                  <span class="list__meta">async / await と DB セッション管理にフォーカスしたクイズセット</span>
                </div>
                <div class="list__actions">
                  <button class="primary-btn primary-btn--outline js-open-quiz-set">クイズを選ぶ</button>
                </div>
              </div>
              <div class="quiz-set-item__meta">
                <span>前回挑戦: 2025/10/21</span>
                <span class="quiz-set-item__meta-separator">・</span>
                <span>正答率: 64%</span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    `;
  },
};
