import { OverviewView } from "./OverviewView.js";

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

export const OverviewController = {
  mount() {
    const root = OverviewView.getRoot();
    OverviewView.render(root);
    updateHeader(OverviewView);
    activateSection(OverviewView.key);
  },
  unmount() {
    const root = OverviewView.getRoot();
    if (root) root.innerHTML = "";
  },
};
