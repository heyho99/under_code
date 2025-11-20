export const QuizSetDetailView = {
  key: "quiz-set-detail",
  title: "クイズセット内のクイズを選ぶ",
  subtitle: "選択したクイズセットに含まれるクイズの一覧から、挑戦したい問題を選択します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-set-detail"]');
  },
};
