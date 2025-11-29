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
        <section class="card card--full">
          <header class="card__header">
            <h2 class="card__title">学習の進捗</h2>
            <p class="card__subtitle">全体の累計進捗率（タイプ別）</p>
          </header>
          <div class="card__body">
            <div class="progress-summary">
              <div class="progress-summary__left card__body--list">
                <ul class="list" id="js-category-list">
                  <li class="list__item" data-category="syntax">
                    <div class="list__primary">
                      <span class="list__title">基本文法</span>
                      <span class="list__meta">0 / 0 問完了 ・ 完了率 0%</span>
                    </div>
                    <div class="progress">
                      <div class="progress__bar" style="width: 0%"></div>
                    </div>
                  </li>
                  <li class="list__item" data-category="logic">
                    <div class="list__primary">
                      <span class="list__title">処理</span>
                      <span class="list__meta">0 / 0 問完了 ・ 完了率 0%</span>
                    </div>
                    <div class="progress">
                      <div class="progress__bar" style="width: 0%"></div>
                    </div>
                  </li>
                  <li class="list__item" data-category="function">
                    <div class="list__primary">
                      <span class="list__title">関数</span>
                      <span class="list__meta">0 / 0 問完了 ・ 完了率 0%</span>
                    </div>
                    <div class="progress">
                      <div class="progress__bar" style="width: 0%"></div>
                    </div>
                  </li>
                  <li class="list__item" data-category="class">
                    <div class="list__primary">
                      <span class="list__title">クラス・モジュール</span>
                      <span class="list__meta">0 / 0 問完了 ・ 完了率 0%</span>
                    </div>
                    <div class="progress">
                      <div class="progress__bar" style="width: 0%"></div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="progress-summary__right">
                <div class="overall-donut-card">
                  <div class="overall-donut-card__title">全体完了率</div>
                  <div class="overall-donut-card__chart">
                    <canvas id="js-overall-progress-chart"></canvas>
                    <div class="overall-donut-card__center" id="js-overall-progress-percent">0%</div>
                  </div>
                  <div class="overall-donut-card__meta" id="js-overall-progress-meta">完了 0 / 0 問</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--full">
          <header class="card__header card__header--with-controls">
            <div class="card__header-main">
              <h2 class="card__title">日別の取り組み</h2>
              <p class="card__subtitle">直近の正解数（取り組み数）</p>
            </div>
            <div class="activity-controls">
              <div class="segmented" data-activity-range>
                <button class="segmented__item" data-range="7">直近7日</button>
                <button class="segmented__item" data-range="14">直近14日</button>
                <button class="segmented__item" data-range="30">直近30日</button>
                <button class="segmented__item segmented__item--active" data-range="all">全期間</button>
              </div>
            </div>
          </header>
          <div class="card__body">
            <div class="activity-summary">
              <div class="activity-summary-card">
                <span class="activity-summary__label">この期間の取り組み数</span>
                <span class="activity-summary__value" id="js-activity-range-total">0 問</span>
              </div>
            </div>
            <div class="activity-chart-container">
              <canvas id="js-activity-chart" class="activity-chart-canvas"></canvas>
            </div>
          </div>
        </section>
      </div>
    `;
  },
};
