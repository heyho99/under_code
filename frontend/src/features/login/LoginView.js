export const LoginView = {
  key: "login",
  title: "ログイン",
  subtitle: "アカウントにサインインしてダッシュボードにアクセスします。",
  getRoot() {
    return document.querySelector('[data-view-section="login"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <h1 class="login-card__title">UnderCode にログイン</h1>
          <p class="login-card__subtitle">
            登録したメールアドレスとパスワードでサインインしてください。
          </p>
          <form class="login-form" id="js-login-form">
            <div class="login-form__field">
              <label class="login-form__label" for="js-login-email">メールアドレス</label>
              <input
                id="js-login-email"
                class="login-form__input"
                type="email"
                name="email"
                autocomplete="email"
                required
              />
            </div>
            <div class="login-form__field">
              <label class="login-form__label" for="js-login-password">パスワード</label>
              <input
                id="js-login-password"
                class="login-form__input"
                type="password"
                name="password"
                autocomplete="current-password"
                required
              />
            </div>
            <p class="login-form__error" id="js-login-error" aria-live="polite"></p>
            <button type="submit" class="primary-btn login-form__submit">
              ログイン
            </button>
            <p class="login-card__footer-text">
              まだアカウントをお持ちでない方は
              <button type="button" class="login-link-btn" id="js-go-signup">
                新規登録
              </button>
              してください。
            </p>
          </form>
        </div>
      </div>
    `;
  },
};
