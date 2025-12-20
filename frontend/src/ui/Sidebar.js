export function setupNav(navigate) {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (!target) return;
      navigate(target);
    });
  });

  const updateAccountUI = () => {
    const nameEl = document.querySelector("#js-sidebar-account-name");
    const emailEl = document.querySelector("#js-sidebar-account-email");
    const avatarEl = document.querySelector("#js-sidebar-account-avatar");
    const cardNameEl = document.querySelector("#js-sidebar-account-card-name");
    const cardEmailEl = document.querySelector("#js-sidebar-account-card-email");
    const cardAvatarEl = document.querySelector("#js-sidebar-account-card-avatar");

    let user = null;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("currentUser");
        if (raw) {
          user = JSON.parse(raw);
        }
      }
    } catch {
      user = null;
    }

    const username = user && user.username ? String(user.username) : "ゲスト";
    const email = user && user.email ? String(user.email) : "guest@example.com";
    const initial = username ? username.trim().slice(0, 2).toUpperCase() : "UC";

    if (nameEl) nameEl.textContent = username;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = initial;
    if (cardNameEl) cardNameEl.textContent = username;
    if (cardEmailEl) cardEmailEl.textContent = email;
    if (cardAvatarEl) cardAvatarEl.textContent = initial;
  };

  const account = document.querySelector("#js-sidebar-account");
  const accountMenu = document.querySelector("#js-sidebar-account-menu");
  const logoutButton = document.querySelector("#js-logout-button");

  updateAccountUI();
  if (typeof window !== "undefined") {
    window.addEventListener("auth:changed", updateAccountUI);
    window.addEventListener("storage", (event) => {
      if (!event || (event.key !== "currentUser" && event.key !== "authToken")) {
        return;
      }
      updateAccountUI();
    });
  }

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
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem("authToken");
          window.localStorage.removeItem("currentUser");
        }
      } catch {
        // ignore
      }

      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:changed"));
        }
      } catch {
        // ignore
      }

      if (accountMenu) {
        accountMenu.classList.remove("sidebar-account-menu--open");
      }
      if (account) {
        account.setAttribute("aria-expanded", "false");
      }

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
