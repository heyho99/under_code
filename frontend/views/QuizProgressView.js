export const QuizProgressView = {
  key: "quiz-progress",
  title: "クイズ進捗",
  subtitle: "プロジェクト別の進捗と直近の学習傾向を確認します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-progress"]');
  },
};
