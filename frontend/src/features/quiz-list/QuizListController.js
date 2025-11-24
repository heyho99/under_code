import { QuizListView } from "./QuizListView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizListController = {
  mount() {
    const root = QuizListView.getRoot();
    QuizListView.render(root);
    updateHeader(QuizListView);
    activateSection(QuizListView.key);

    if (!root) {
      return;
    }

    const openQuizSetButtons = root.querySelectorAll(".js-open-quiz-set");
    openQuizSetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/problem-list");
      });
    });
  },
  unmount() {
    const root = QuizListView.getRoot();
    if (root) root.innerHTML = "";
  },
};
