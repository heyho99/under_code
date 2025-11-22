import { LoginView } from "./LoginView.js";
import { navigate } from "../../router/router.js";

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
      form.addEventListener("submit", (event) => {
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

        // ダミー認証: とりあえずどんな値でも成功扱いにする
        navigate("#/dashboard");
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
