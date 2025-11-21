export const QuizProgressView = {
  key: "quiz-progress",
  title: "クイズ進捗",
  subtitle: "プロジェクト別の進捗と直近の学習傾向を確認します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-progress"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="layout-grid layout-grid--two">
        <section class="card">
          <header class="card__header">
            <h2 class="card__title">プロジェクト別の進捗</h2>
            <p class="card__subtitle">QAセットと回答履歴を集約</p>
          </header>
          <div class="card__body card__body--list">
            <ul class="list">
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">payment-service</span>
                  <span class="list__meta">24 / 40 問完了 ・ 正答率 78%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 60%"></div>
                </div>
              </li>
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">next-dashboard</span>
                  <span class="list__meta">10 / 20 問完了 ・ 正答率 65%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 50%"></div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section class="card">
          <header class="card__header">
            <h2 class="card__title">セッションサマリ</h2>
            <p class="card__subtitle">直近の学習傾向を可視化</p>
          </header>
          <div class="card__body card__body--stack">
            <div class="stat-row">
              <div class="stat">
                <div class="stat__label">7日間の正答率</div>
                <div class="stat__value">72%</div>
              </div>
              <div class="stat">
                <div class="stat__label">平均回答時間</div>
                <div class="stat__value">38秒</div>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat">
                <div class="stat__label">構造系クイズ</div>
                <div class="stat__value">57%</div>
              </div>
              <div class="stat">
                <div class="stat__label">文法系クイズ</div>
                <div class="stat__value">84%</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  },
};
