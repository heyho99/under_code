import { SignupView } from "./SignupView.js";
import { navigate } from "../../router/router.js";

export const SignupController = {
  mount() {
    const root = SignupView.getRoot();
    SignupView.render(root);

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.classList.add("app-shell--login");
    }

    const form = root && root.querySelector("#js-signup-form");
    const nameInput = root && root.querySelector("#js-signup-name");
    const emailInput = root && root.querySelector("#js-signup-email");
    const passwordInput = root && root.querySelector("#js-signup-password");
    const errorEl = root && root.querySelector("#js-signup-error");
    const goLoginBtn = root && root.querySelector("#js-go-login-from-signup");

    const clearError = () => {
      if (errorEl) errorEl.textContent = "";
    };

    if (goLoginBtn) {
      goLoginBtn.addEventListener("click", () => {
        navigate("#/login");
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearError();

        const name = nameInput && nameInput.value.trim();
        const email = emailInput && emailInput.value.trim();
        const password = passwordInput && passwordInput.value.trim();

        if (!name || !email || !password) {
          if (errorEl) {
            errorEl.textContent = "すべての項目を入力してください。";
          }
          return;
        }

        // ダミー登録: 実際のAPI連携は後で実装する想定
        navigate("#/login");
      });
    }
  },
  unmount() {
    const root = SignupView.getRoot();
    if (root) {
      root.innerHTML = "";
    }

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.classList.remove("app-shell--login");
    }
  },
};
