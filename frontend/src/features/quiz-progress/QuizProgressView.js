// カテゴリ設定: comingSoon を false にすると通常表示に切り替わる
const CATEGORY_CONFIG = {
  syntax: { label: "基本文法", comingSoon: false },
  function: { label: "関数", comingSoon: true },
  class: { label: "クラス・モジュール", comingSoon: true },
};

const renderCategoryItem = (key, config) => {
  if (config.comingSoon) {
    return `
      <li class="list__item list__item--coming-soon" data-category="${key}">
        <div class="list__primary">
          <span class="list__title">${config.label}</span>
          <span class="list__badge list__badge--coming-soon">Coming Soon</span>
        </div>
      </li>
    `;
  }
  return `
    <li class="list__item" data-category="${key}">
      <div class="list__primary">
        <span class="list__title">${config.label}</span>
        <span class="list__meta">取り組み 0 / 0 問 ・ 正解 0 / 0 問</span>
      </div>
      <div class="progress-stack">
        <div class="progress-stack__row">
          <span class="progress-stack__label">取り組み</span>
          <div class="progress">
            <div class="progress__bar progress__bar--attempted" style="width: 0%"></div>
          </div>
        </div>
        <div class="progress-stack__row">
          <span class="progress-stack__label">正解</span>
          <div class="progress">
            <div class="progress__bar progress__bar--solved" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </li>
  `;
};

export { CATEGORY_CONFIG };

export const QuizProgressView = {
  key: "quiz-progress",
  title: "クイズ進捗",
  subtitle: "プロジェクト別の進捗と直近の学習傾向を確認します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-progress"]');
  },
  render(root) {
    if (!root) return;

    const categoryListHtml = Object.entries(CATEGORY_CONFIG)
      .map(([key, config]) => renderCategoryItem(key, config))
      .join('');

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
                  ${categoryListHtml}
                </ul>
              </div>
              <div class="progress-summary__right">
                <div class="overall-donut-card">
                  <div class="overall-donut-card__title">全体取り組み率</div>
                  <div class="overall-donut-card__chart">
                    <canvas id="js-overall-progress-chart"></canvas>
                    <div class="overall-donut-card__center" id="js-overall-progress-percent">0%</div>
                  </div>
                  <div class="overall-donut-card__meta" id="js-overall-progress-meta">取り組み 0 / 0 問</div>
                  <div class="overall-donut-card__meta" id="js-overall-solved-meta">正解 0 / 0 問</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--full">
          <header class="card__header">
            <h2 class="card__title">言語別の進捗</h2>
            <p class="card__subtitle">取り組み数（ユニーク）・正解数（ユニーク）</p>
          </header>
          <div class="card__body card__body--list">
            <ul class="list" id="js-language-list"></ul>
          </div>
        </section>

        <section class="card card--full">
          <header class="card__header card__header--with-controls">
            <div class="card__header-main">
              <h2 class="card__title">日別の取り組み</h2>
              <p class="card__subtitle">直近の提出数・正解数</p>
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
                <span class="activity-summary__label">この期間の提出数</span>
                <span class="activity-summary__value" id="js-activity-range-submissions-total">0 回</span>
              </div>
              <div class="activity-summary-card">
                <span class="activity-summary__label">この期間の正解数</span>
                <span class="activity-summary__value" id="js-activity-range-solved-total">0 回</span>
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
