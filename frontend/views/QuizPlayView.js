export const QuizPlayView = {
  key: "quiz-play",
  title: "クイズを解く",
  subtitle:
    "選択したクイズの詳細と回答エリアを表示し、Python実行環境で試すことを想定した画面です。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-play"]');
  },
};
