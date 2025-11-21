export const QuizDesignView = {
  key: "quiz-design",
  title: "クイズ作成ポリシー",
  subtitle: "クイズの配分や検証方法を設計します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-design"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="layout-grid layout-grid--two">
        <section class="card">
          <header class="card__header">
            <h2 class="card__title">クイズ作成ポリシー</h2>
            <p class="card__subtitle">何を優先して理解させたいかを定義</p>
          </header>
          <div class="card__body card__body--stack">
            <div class="setting-row">
              <div>
                <div class="setting-row__label">フォーカス</div>
                <div class="setting-row__hint">設計 / 実装 / テストなどの比率</div>
              </div>
              <div class="pill-group">
                <span class="pill pill--active">設計 40%</span>
                <span class="pill">実装 40%</span>
                <span class="pill">テスト 20%</span>
              </div>
            </div>

            <div class="setting-row">
              <div>
                <div class="setting-row__label">クイズ数</div>
                <div class="setting-row__hint">1セッションあたりの問数</div>
              </div>
              <div class="slider-row">
                <div class="slider-track">
                  <div class="slider-thumb" style="width: 60%"></div>
                </div>
                <span class="slider-value">12問</span>
              </div>
            </div>

            <div class="setting-row">
              <div>
                <div class="setting-row__label">検証方法</div>
                <div class="setting-row__hint">回答の正誤判定ロジック</div>
              </div>
              <ul class="bullet-list bullet-list--dense">
                <li>paiza.io APIなど外部実行環境を利用</li>
                <li>入出力が定まる問題はローカルで検証</li>
                <li>構造理解クイズは厳格なスキーマ検証を実施</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    `;
  },
};
