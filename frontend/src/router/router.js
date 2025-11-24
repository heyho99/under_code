import { routes } from "./routes.js";

let currentController = null;

const navMapping = {
  "#/problem-list": "#/quiz-set-list",
  "#/quiz-play": "#/quiz-set-list",
};

function setActiveNav(path) {
  const targetPath = navMapping[path] || path;
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    const itemPath = item.dataset.nav;
    const isActive = itemPath === targetPath;
    item.classList.toggle("nav-item--active", isActive);
  });
}

function handleRouteChange() {
  const path = window.location.hash || "#/quiz-creation";
  const nextController = routes[path];
  if (!nextController) {
    return;
  }

  if (currentController && typeof currentController.unmount === "function") {
    currentController.unmount();
  }

  currentController = nextController;

  if (currentController && typeof currentController.mount === "function") {
    currentController.mount();
  }

  setActiveNav(path);
}

export function initRouter({ defaultPath = "#/quiz-creation" } = {}) {
  window.addEventListener("hashchange", handleRouteChange);

  if (!window.location.hash) {
    window.location.hash = defaultPath;
  } else {
    handleRouteChange();
  }
}

export function navigate(path) {
  if (window.location.hash === path) {
    handleRouteChange();
  } else {
    window.location.hash = path;
  }
}
