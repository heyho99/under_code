import { QuizSetDetailView } from "./QuizSetDetailView.js";
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
