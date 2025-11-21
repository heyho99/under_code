import { QuizListView } from "./QuizListView.js";
import { navigate } from "../../router/router.js";

function updateHeader(view) {
  const titleEl = document.querySelector("[data-view-title]");
  const subtitleEl = document.querySelector("[data-view-subtitle]");
  if (titleEl) titleEl.textContent = view.title || "";
  if (subtitleEl) subtitleEl.textContent = view.subtitle || "";
}

function activateSection(sectionKey) {
  const views = document.querySelectorAll(".view");
  views.forEach((el) => {
    const isActive = el.dataset.viewSection === sectionKey;
    el.classList.toggle("view--active", isActive);
  });
}

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
        navigate("#/quiz-set-detail");
      });
    });
  },
  unmount() {
    const root = QuizListView.getRoot();
    if (root) root.innerHTML = "";
  },
};
