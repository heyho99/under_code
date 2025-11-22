import { QuizPlayView } from "./QuizPlayView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizPlayController = {
  mount() {
    const root = QuizPlayView.getRoot();
    QuizPlayView.render(root);
    updateHeader(QuizPlayView);
    activateSection(QuizPlayView.key);

    if (!root) {
      return;
    }

    const backToQuizListButtons = root.querySelectorAll(".js-back-to-quiz-list");
    const runCodeButtons = root.querySelectorAll(".js-run-code");
    const quizOutputEl = root.querySelector("[data-quiz-output]");
    const answerTextarea = root.querySelector(".code-editor-mock__textarea");

    backToQuizListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/quiz-set-detail");
      });
    });

    runCodeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!quizOutputEl) return;

        const code = answerTextarea ? answerTextarea.value.trim() : "";
        if (!code) {
          quizOutputEl.textContent =
            ">>> 実行しました\n\n※ コードが空のため、出力はありません。";
        } else {
          quizOutputEl.textContent =
            ">>> 実行しました\n\n（ここに Python 実行結果が表示されます）";
        }
      });
    });
  },
  unmount() {
    const root = QuizPlayView.getRoot();
    if (root) root.innerHTML = "";
  },
};
