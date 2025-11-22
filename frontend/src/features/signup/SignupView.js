export const SignupView = {
  key: "signup",
  title: "新規登録",
  subtitle: "アカウントを作成して UnderCode をはじめましょう。",
  getRoot() {
    return document.querySelector('[data-view-section="signup"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <h1 class="login-card__title">アカウントを作成</h1>
          <p class="login-card__subtitle">
            ユーザー名・メールアドレス・パスワードを設定してください。
          </p>
          <form class="login-form" id="js-signup-form">
            <div class="login-form__field">
              <label class="login-form__label" for="js-signup-name">ユーザー名</label>
              <input
                id="js-signup-name"
                class="login-form__input"
                type="text"
                name="name"
                autocomplete="name"
                required
              />
            </div>
            <div class="login-form__field">
              <label class="login-form__label" for="js-signup-email">メールアドレス</label>
              <input
                id="js-signup-email"
                class="login-form__input"
                type="email"
                name="email"
                autocomplete="email"
                required
              />
            </div>
            <div class="login-form__field">
              <label class="login-form__label" for="js-signup-password">パスワード</label>
              <input
                id="js-signup-password"
                class="login-form__input"
                type="password"
                name="password"
                autocomplete="new-password"
                required
              />
            </div>
            <p class="login-form__error" id="js-signup-error" aria-live="polite"></p>
            <button type="submit" class="primary-btn login-form__submit">
              新規登録
            </button>
            <p class="login-card__footer-text">
              すでにアカウントをお持ちですか？
              <button type="button" class="login-link-btn" id="js-go-login-from-signup">ログインはこちら</button>
            </p>
          </form>
        </div>
      </div>
    `;
  },
};
