import { QuizDesignView } from "./QuizDesignView.js";

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

export const QuizDesignController = {
  mount() {
    const root = QuizDesignView.getRoot();
    QuizDesignView.render(root);
    updateHeader(QuizDesignView);
    activateSection(QuizDesignView.key);
  },
  unmount() {
    const root = QuizDesignView.getRoot();
    if (root) root.innerHTML = "";
  },
};
