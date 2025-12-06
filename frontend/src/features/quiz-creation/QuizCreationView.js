export const QuizCreationView = {
  key: "quiz-creation",
  title: "クイズを作成する",
  subtitle:
    "プロジェクトの読み込みからクイズ生成、一覧からの挑戦までを一画面で行います。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-creation"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="wizard-container">
        <nav class="wizard-sidebar">
          <div class="wizard-step-item wizard-step-item--active" data-step-target="1">
            <span class="wizard-step-number">1</span>
            <span class="wizard-step-label">ソースコード読み込み</span>
          </div>
          <div class="wizard-step-item" data-step-target="2">
            <span class="wizard-step-number">2</span>
            <span class="wizard-step-label">クイズ詳細設定</span>
          </div>
          <div class="wizard-step-item" data-step-target="3">
            <span class="wizard-step-number">3</span>
            <span class="wizard-step-label">確認・作成</span>
          </div>
        </nav>

        <div class="wizard-main">
          <!-- STEP 1 -->
          <div class="step step--active" data-step="1">
            <div class="step-content-centered">
              <section class="upload-hero">
                <div class="upload-hero__icon-box">
                  <span class="material-symbols-outlined">folder_data</span>
                </div>
                <h2 class="upload-hero__title">ソースコードを読み込む</h2>
                <p class="upload-hero__subtitle">
                  解析対象となるソースコードファイルを1つ以上選択してください。
                </p>

                <div class="dropzone dropzone--large">
                  <div class="dropzone__icon">
                    <span class="material-symbols-outlined">cloud_upload</span>
                  </div>
                  <div class="dropzone__content">
                    <div class="dropzone__hint-main">ここにファイルをドラッグ＆ドロップ</div>
                    <div class="dropzone__hint-sub">または</div>
                    <button class="primary-btn primary-btn--outline">参照して選択...</button>
                  </div>
                </div>
              </section>
            </div>
            <div class="step-actions">
              <button class="primary-btn js-step-next" data-next-step="2">次へ</button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="step" data-step="2">
            <div class="layout-grid">
              <section class="card">
                <header class="card__header">
                  <h2 class="card__title">クイズ作成方針</h2>
                  <p class="card__subtitle">基本文法の出題数を設定してください。</p>
                </header>
                <div class="card__body">
                  <div class="quiz-settings-list">
                    <div class="quiz-setting-item quiz-type-row" data-quiz-type="basic">
                      <div class="quiz-setting-item__icon basic">
                        <span class="material-symbols-outlined">code</span>
                      </div>
                      <div class="quiz-setting-item__info">
                        <div class="quiz-setting-item__name">基本文法</div>
                        <div class="quiz-setting-item__desc">変数、型、制御構文などの基礎的な問題</div>
                      </div>
                      <div class="quiz-setting-item__control">
                        <div class="quiz-counter">
                          <button
                            class="quiz-counter-btn quiz-counter-btn--minus"
                            type="button"
                            data-delta="-10"
                            aria-label="基本文法を減らす"
                          >
                            <span class="material-symbols-outlined">remove</span>
                          </button>
                          <span class="quiz-counter-value" data-count="0">0問</span>
                          <button
                            class="quiz-counter-btn quiz-counter-btn--plus"
                            type="button"
                            data-delta="10"
                            aria-label="基本文法を増やす"
                          >
                            <span class="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="1">戻る</button>
              <button class="primary-btn js-step-next" data-next-step="3">確認へ</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div class="step" data-step="3">
            <div class="layout-grid">
              <section class="card">
                <header class="card__header">
                  <h2 class="card__title">クイズ設定の確認</h2>
                  <p class="card__subtitle">以下の内容でクイズを作成します。よろしければ作成ボタンを押してください。</p>
                </header>
                <div class="card__body">
                  <div class="confirmation-header-row">
                    <div class="confirmation-header__left">
                      <div class="login-form__field">
                        <label class="login-form__label">クイズセットのタイトル</label>
                        <input type="text" class="login-form__input" placeholder="例: React基礎クイズ" data-quiz-title>
                      </div>
                    </div>
                    <div class="confirmation-header__right">
                      <div class="confirmation-hero">
                        <div class="confirmation-hero__content">
                          <div class="confirmation-hero__label">作成するクイズの合計</div>
                          <div class="confirmation-hero__value">
                            <span class="confirmation-hero__number" data-total-count>0</span>
                            <span class="confirmation-hero__unit">問</span>
                          </div>
                        </div>
                        <div class="confirmation-hero__icon">
                          <span class="material-symbols-outlined">quiz</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="confirmation-description-row">
                    <div class="login-form__field">
                      <label class="login-form__label">説明 (オプション)</label>
                      <textarea class="quiz-request-textarea" placeholder="このクイズセットに関するメモや説明を入力..." data-quiz-description style="min-height: 80px;"></textarea>
                    </div>
                  </div>

                  <div class="confirmation-grid">
                    <div class="confirmation-col">
                      <div class="confirmation-section">
                        <h3 class="confirmation-section__title">
                          <span class="material-symbols-outlined">category</span>
                          出題タイプ別の内訳
                        </h3>
                        <ul class="confirmation-list">
                          <li class="confirmation-list__item">
                            <div class="confirmation-list__info">
                              <span class="confirmation-list__label">基本文法</span>
                              <span class="confirmation-list__desc">変数、型、制御構文など</span>
                            </div>
                            <span class="confirmation-list__value" data-summary-count="basic">0問</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div class="step-actions step-actions--between">
              <button class="primary-btn primary-btn--outline js-step-prev" data-prev-step="2">戻る</button>
              <button class="primary-btn js-generate-quiz">この内容でクイズを作成</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
