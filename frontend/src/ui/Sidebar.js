export function setupNav(navigate) {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (!target) return;
      navigate(target);
    });
  });

  const account = document.querySelector("#js-sidebar-account");
  const accountMenu = document.querySelector("#js-sidebar-account-menu");
  const logoutButton = document.querySelector("#js-logout-button");

  if (account && accountMenu) {
    account.addEventListener("click", () => {
      const isOpen = accountMenu.classList.toggle("sidebar-account-menu--open");
      account.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!accountMenu.classList.contains("sidebar-account-menu--open")) return;
      if (target instanceof Element && target.closest(".sidebar__footer")) {
        return;
      }
      accountMenu.classList.remove("sidebar-account-menu--open");
      account.setAttribute("aria-expanded", "false");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const appShell = document.querySelector(".app-shell");
      if (appShell) {
        appShell.classList.add("app-shell--login");
      }
      navigate("#/login");
    });
  }
}

export function setupSidebarToggle() {
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
