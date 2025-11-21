import { initRouter, navigate } from "./router/router.js";

function setupNav() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (!target) return;
      navigate(target);
    });
  });
}

function setupSidebarToggle() {
  const appShell = document.querySelector(".app-shell");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebarToggleIcon = document.querySelector(".sidebar-toggle__icon");

  if (appShell && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const isCollapsed = appShell.classList.toggle("app-shell--sidebar-collapsed");

      if (sidebarToggleIcon) {
        sidebarToggleIcon.textContent = isCollapsed
          ? "keyboard_double_arrow_right"
          : "keyboard_double_arrow_left";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupSidebarToggle();
  initRouter({ defaultPath: "#/project" });
});
