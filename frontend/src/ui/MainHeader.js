export function updateHeader(view) {
  const titleEl = document.querySelector("[data-view-title]");
  const subtitleEl = document.querySelector("[data-view-subtitle]");
  if (titleEl) titleEl.textContent = view.title || "";
  if (subtitleEl) subtitleEl.textContent = view.subtitle || "";
}

export function activateSection(sectionKey) {
  const views = document.querySelectorAll(".view");
  views.forEach((el) => {
    const isActive = el.dataset.viewSection === sectionKey;
    el.classList.toggle("view--active", isActive);
  });
}
