export const QuizPlayView = {
  key: "quiz-play",
  title: "クイズを解く",
  subtitle:
    "選択したクイズの詳細と回答エリアを表示し、Python実行環境で試すことを想定した画面です。",
  getRoot() {
    return document.querySelector('[data-view-section="quiz-play"]');
  },
  render(root) {
    if (!root) return;

    root.innerHTML = `
      <section class="card">
        <header class="card__header">
          <h2 class="card__title">クイズ: 認証フローの責務分離</h2>
          <p class="card__subtitle">Router / Service / Repository の役割を踏まえて、コードを読み解きながら回答します。</p>
        </header>
        <div class="card__body card__body--stack">
          <div class="setting-row">
            <div>
              <div class="setting-row__label">問題</div>
              <div class="setting-row__hint">下記の FastAPI コード片を前提に、責務分離の観点から空欄を埋めてください。</div>
            </div>
          </div>
          <pre class="schema-preview"><code>from fastapi import APIRouter, Depends

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest, service: AuthService = Depends(...)):
    # TODO: 認証ロジックをどこに置くべきか？
    ...
</code></pre>
          <div class="setting-row">
            <div>
              <div class="setting-row__label">回答エリア</div>
              <div class="setting-row__hint">コードを実行して確認できます。</div>
            </div>
          </div>
          <div class="code-editor-mock">
            <div class="code-editor-mock__header">
              <div class="code-editor-mock__tabs">
                <span class="code-editor-mock__tab code-editor-mock__tab--active">answer.py</span>
              </div>
              <div class="code-editor-mock__header-buttons">
                <span class="code-editor-mock__dot"></span>
                <span class="code-editor-mock__dot"></span>
                <span class="code-editor-mock__dot"></span>
              </div>
            </div>
            <div class="code-editor-mock__body">
              <div class="code-editor-mock__gutter">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <textarea class="code-editor-mock__textarea" placeholder="ここに回答用のコードを記述"></textarea>
            </div>
            <div class="code-editor-mock__footer">
              Python 3.11 / FastAPI / uvicorn
            </div>
          </div>
          <div class="quiz-run">
            <div class="quiz-output">
              <div class="quiz-output__label">
                <span class="material-symbols-outlined" style="font-size: 16px;">terminal</span>
                コンソール出力
              </div>
              <pre class="quiz-output__body" data-quiz-output>>> 準備完了</pre>
            </div>

            <div class="quiz-feedback" data-quiz-feedback style="display: none;">
              <!-- ここに正解やヒントがカードとして表示されます -->
            </div>

            <div class="quiz-run__controls">
              <button class="primary-btn primary-btn--subtle js-back-to-quiz-list">
                <span class="material-symbols-outlined">arrow_back</span>
                一覧へ
              </button>
              <div class="quiz-run__actions">
                <button class="primary-btn primary-btn--subtle js-hint-v2">
                  <span class="material-symbols-outlined">lightbulb</span>
                  ヒント
                </button>
                <button class="primary-btn primary-btn--subtle js-view-answer">
                  <span class="material-symbols-outlined">visibility</span>
                  正解
                </button>
                <button class="primary-btn primary-btn--outline js-run-code">
                  <span class="material-symbols-outlined">play_arrow</span>
                  実行
                </button>
                <button class="primary-btn js-submit-quiz">
                  <span class="material-symbols-outlined">check</span>
                  提出
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },
};
