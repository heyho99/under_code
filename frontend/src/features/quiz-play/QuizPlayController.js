import { QuizPlayView } from "./QuizPlayView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizPlayController = {
  mount() {
    const root = QuizPlayView.getRoot();
    QuizPlayView.render(root);
    updateHeader(QuizPlayView);
    activateSection(QuizPlayView.key);

    if (!root) {
      return;
    }

    const backToQuizListButtons = root.querySelectorAll(".js-back-to-quiz-list");
    const runCodeButtons = root.querySelectorAll(".js-run-code");
    const submitQuizButtons = root.querySelectorAll(".js-submit-quiz");
    const viewAnswerButtons = root.querySelectorAll(".js-view-answer");
    const hintV2Buttons = root.querySelectorAll(".js-hint-v2");
    
    const quizOutputEl = root.querySelector("[data-quiz-output]");
    const quizFeedbackEl = root.querySelector("[data-quiz-feedback]");
    const answerTextarea = root.querySelector(".code-editor-mock__textarea");

    const showFeedback = (title, content, isAnswer = false) => {
      if (!quizFeedbackEl) return;
      
      quizFeedbackEl.style.display = "block";
      quizFeedbackEl.className = "quiz-feedback"; // reset class
      if (isAnswer) {
        quizFeedbackEl.classList.add("quiz-feedback--answer");
      }

      const icon = isAnswer ? "check_circle" : "lightbulb";
      
      quizFeedbackEl.innerHTML = `
        <div class="quiz-feedback__title">
          <span class="material-symbols-outlined">${icon}</span>
          ${title}
        </div>
        <div class="quiz-feedback__content">${content}</div>
      `;
    };

    backToQuizListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/problem-list");
      });
    });

    runCodeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!quizOutputEl) return;

        // フィードバックエリアを隠す
        if (quizFeedbackEl) quizFeedbackEl.style.display = "none";

        const code = answerTextarea ? answerTextarea.value.trim() : "";
        if (!code) {
          quizOutputEl.textContent =
            ">>> 実行しました\n\n※ コードが空のため、出力はありません。";
        } else {
          quizOutputEl.textContent =
            ">>> 実行しました\n\n（ここに Python 実行結果が表示されます）";
        }
      });
    });

    submitQuizButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        showFeedback("正解です！", "素晴らしい！コードは正しく実装されています。\n実行時間: 0.02s", true);
      });
    });

    viewAnswerButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        showFeedback("正解と解説", "def login(request: LoginRequest, service: AuthService = Depends(get_auth_service)):\n    # 認証ロジックはService層に委譲するのが一般的です\n    return service.login(request.email, request.password)", false);
      });
    });

    hintV2Buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        showFeedback("AIヒント", "Depends(...) の中身は、共通の認証ロジックを持つ関数（依存性注入）を指定するのが一般的です。\nFastAPIのドキュメントにおける 'Dependency Injection' の章を思い出してみましょう。", false);
      });
    });
  },
  unmount() {
    const root = QuizPlayView.getRoot();
    if (root) root.innerHTML = "";
  },
};
