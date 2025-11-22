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
            <h2 class="card__title">学習の進捗</h2>
            <p class="card__subtitle">全体の累計進捗率（タイプ別）</p>
          </header>
          <div class="card__body card__body--list">
            <ul class="list">
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">基本文法</span>
                  <span class="list__meta">42 / 100 問完了 ・ 完了率 42%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 42%"></div>
                </div>
              </li>
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">処理</span>
                  <span class="list__meta">15 / 50 問完了 ・ 完了率 30%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 30%"></div>
                </div>
              </li>
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">関数</span>
                  <span class="list__meta">28 / 40 問完了 ・ 完了率 70%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 70%"></div>
                </div>
              </li>
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">クラス・モジュール</span>
                  <span class="list__meta">5 / 25 問完了 ・ 完了率 20%</span>
                </div>
                <div class="progress">
                  <div class="progress__bar" style="width: 20%"></div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section class="card">
          <header class="card__header">
            <h2 class="card__title">学習統計</h2>
            <p class="card__subtitle">取り組んだ問題数の推移</p>
          </header>
          <div class="card__body card__body--stack">
            <div class="stat-row">
              <div class="stat stat--highlight">
                <div class="stat__label">今までの累計</div>
                <div class="stat__value">90 問</div>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat">
                <div class="stat__label">直近一か月</div>
                <div class="stat__value">45 問</div>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat">
                <div class="stat__label">直近一週間</div>
                <div class="stat__value">12 問</div>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--full">
          <header class="card__header">
            <h2 class="card__title">日別の取り組み</h2>
            <p class="card__subtitle">直近30日間の正解数（取り組み数）</p>
          </header>
          <div class="card__body">
            <div class="activity-chart-container">
              <canvas id="js-activity-chart" class="activity-chart-canvas"></canvas>
            </div>
          </div>
        </section>
      </div>
    `;
  },
};
