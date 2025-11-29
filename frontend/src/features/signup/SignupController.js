import { SignupView } from "./SignupView.js";
import { navigate } from "../../router/router.js";
import { authApi } from "../../core/api/authApi.js";

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
      form.addEventListener("submit", async (event) => {
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

        try {
          const user = await authApi.signup({
            username: name,
            email,
            password,
          });

          try {
            if (typeof window !== "undefined" && window.localStorage) {
              window.localStorage.setItem("authToken", user.token);
              window.localStorage.setItem("currentUser", JSON.stringify(user));
            }
          } catch {
            // localStorage 書き込み失敗時は無視
          }

          navigate("#/dashboard");
        } catch (error) {
          if (errorEl) {
            errorEl.textContent = error.message || "サインアップに失敗しました。";
          }
        }
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
