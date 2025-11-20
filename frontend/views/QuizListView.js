export const QuizListView = {
  key: "quiz-list",
  title: "クイズに挑戦する",
  subtitle: "作成済みのクイズセットから選択し、クイズに挑戦します。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-list"]');
  },
};
