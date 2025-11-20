export const OverviewView = {
  key: "overview",
  title: "構造サマリ",
  subtitle: "ディレクトリ構造と依存関係の俯瞰を確認します。",
  getRoot() {
    return document.querySelector('[data-view-section="overview"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="layout-grid layout-grid--three">
        <section class="card">
          <header class="card__header">
            <h2 class="card__title">構造サマリ</h2>
            <p class="card__subtitle">ディレクトリとレイヤリングの俯瞰</p>
          </header>
          <div class="card__body">
            <ul class="bullet-list">
              <li>エントリポイントと主要エンドポイント</li>
              <li>ドメイン層 / アプリ層 / インフラ層の分離度</li>
              <li>テストコードのカバレッジ分布</li>
            </ul>
          </div>
        </section>

        <section class="card">
          <header class="card__header">
            <h2 class="card__title">依存関係グラフ</h2>
            <p class="card__subtitle">モジュール間の参照関係を可視化</p>
          </header>
          <div class="card__body">
            <div class="graph-placeholder">
              <div class="graph-node graph-node--strong">domain</div>
              <div class="graph-node">usecase</div>
              <div class="graph-node">infra</div>
              <div class="graph-node">interface</div>
            </div>
          </div>
        </section>

        <section class="card">
          <header class="card__header">
            <h2 class="card__title">検知された論点候補</h2>
            <p class="card__subtitle">クイズにしやすいポイント</p>
          </header>
          <div class="card__body card__body--list">
            <ul class="list list--compact">
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">認証フローの責務分離</span>
                  <span class="list__meta">FastAPI Router / Service / Repository</span>
                </div>
                <span class="list__pill">アーキテクチャ</span>
              </li>
              <li class="list__item">
                <div class="list__primary">
                  <span class="list__title">非同期処理とDBセッション</span>
                  <span class="list__meta">async / await とスコープ管理</span>
                </div>
                <span class="list__pill">実装</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    `;
  },
};
