export const OverviewView = {
  key: "overview",
  title: "構造サマリ",
  subtitle: "ディレクトリ構造と依存関係の俯瞰を確認します。",
  getRoot() {
    return document.querySelector('[data-view-section="overview"]');
  },
};
