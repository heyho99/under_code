import { LoginView } from "./LoginView.js";
import { navigate } from "../../router/router.js";
import { authApi } from "../../core/api/authApi.js";

export const LoginController = {
  mount() {
    const root = LoginView.getRoot();
    LoginView.render(root);

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.classList.add("app-shell--login");
    }

    const form = root && root.querySelector("#js-login-form");
    const emailInput = root && root.querySelector("#js-login-email");
    const passwordInput = root && root.querySelector("#js-login-password");
    const errorEl = root && root.querySelector("#js-login-error");
    const goSignupBtn = root && root.querySelector("#js-go-signup");

    const clearError = () => {
      if (errorEl) {
        errorEl.textContent = "";
      }
    };

    if (goSignupBtn) {
      goSignupBtn.addEventListener("click", () => {
        navigate("#/signup");
      });
    }

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();

        const email = emailInput && emailInput.value.trim();
        const password = passwordInput && passwordInput.value.trim();

        if (!email || !password) {
          if (errorEl) {
            errorEl.textContent = "メールアドレスとパスワードを入力してください。";
          }
          return;
        }

        try {
          const user = await authApi.login({ email, password });

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
            errorEl.textContent = error.message || "ログインに失敗しました。";
          }
        }
      });
    }
  },
  unmount() {
    const root = LoginView.getRoot();
    if (root) {
      root.innerHTML = "";
    }

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.classList.remove("app-shell--login");
    }
  },
};
