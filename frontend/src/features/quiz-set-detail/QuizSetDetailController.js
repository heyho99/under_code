import { QuizSetDetailView } from "./QuizSetDetailView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizSetDetailController = {
  mount() {
    const root = QuizSetDetailView.getRoot();
    QuizSetDetailView.render(root);
    updateHeader(QuizSetDetailView);
    activateSection(QuizSetDetailView.key);

    if (!root) {
      return;
    }

    const openQuizPlayButtons = root.querySelectorAll(".js-open-quiz-play");
    const backToQuizSetListButtons = root.querySelectorAll(".js-back-to-quiz-set-list");

    openQuizPlayButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/quiz-play");
      });
    });

    backToQuizSetListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/quiz-list");
      });
    });
  },
  unmount() {
    const root = QuizSetDetailView.getRoot();
    if (root) root.innerHTML = "";
  },
};
