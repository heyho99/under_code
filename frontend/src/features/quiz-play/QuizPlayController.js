import { QuizPlayView } from "./QuizPlayView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizPlayApi } from "../../core/api/quizPlayApi.js";
import { createEditor } from "../../ui/components/CodeEditor/CodeEditorFactory.js";

function getSelectedProblemId() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const raw = window.sessionStorage.getItem("selectedProblemId");
      if (!raw) return null;
      const id = Number(raw);
      if (Number.isNaN(id)) {
        return null;
      }
      return id;
    }
  } catch {
  }
  return null;
}

export const QuizPlayController = {
  _editor: null,
  async mount() {
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
    const editorContainer = root.querySelector("[data-code-editor]");

    const titleEl = root.querySelector("[data-quiz-title]");
    const descriptionEl = root.querySelector("[data-quiz-description]");
    const hintEl = root.querySelector("[data-quiz-hint]");
    const markdownEl = root.querySelector("[data-quiz-markdown]");
    let sampleAnswer = "";

    const problemId = getSelectedProblemId();

    // エディタの初期化
    if (editorContainer) {
      this._editor = createEditor({
        container: editorContainer,
        initialCode: "",
        // type: "cm6", // 必要に応じて "monaco" に変更
      });
    }

    if (!problemId) {
      if (titleEl) titleEl.textContent = "問題が選択されていません";
      if (descriptionEl)
        descriptionEl.textContent = "クイズセットから問題を選択してから、再度お試しください。";
    } else {
      try {
        const detail = await quizPlayApi.getProblemDetail(problemId);
        if (titleEl) {
          titleEl.textContent = detail?.title || `問題 #${problemId}`;
        }
        if (descriptionEl) {
          descriptionEl.textContent = detail?.description || "";
        }
        if (hintEl) {
          // v1 では description を軽くヒントとしても使う程度にとどめる
          hintEl.textContent = detail?.description || "";
        }
        if (markdownEl) {
          // 簡易的に contentMarkdown をそのままテキストとして表示
          markdownEl.textContent = detail?.contentMarkdown || "";
        }
        sampleAnswer = detail?.sampleAnswer || "";
      } catch (_error) {
        if (titleEl) titleEl.textContent = "問題を取得できませんでした";
        if (descriptionEl)
          descriptionEl.textContent = "時間をおいて再度お試しください。";
      }
    }

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
      btn.addEventListener("click", async () => {
        if (!quizOutputEl) return;

        if (quizFeedbackEl) quizFeedbackEl.style.display = "none";

        const code = this._editor ? this._editor.getValue().trim() : "";
        if (!code) {
          quizOutputEl.textContent =
            ">>> 実行しました\n\n※ コードが空のため、出力はありません。";
          return;
        }

        try {
          const result = await quizPlayApi.executeCode({
            language: "python",
            code,
          });
          const stdout = result?.stdout ?? "";
          const stderr = result?.stderr ?? "";
          const exitCode = result?.exitCode;

          let text = ">>> 実行しました\n\n";
          if (stdout) {
            text += stdout;
          }
          if (stderr) {
            text += (stdout ? "\n" : "") + stderr;
          }
          if (!stdout && !stderr) {
            text += "※ 出力はありません。";
          }
          if (exitCode !== undefined && exitCode !== null) {
            text += `\n\n(exitCode: ${exitCode})`;
          }

          quizOutputEl.textContent = text;
        } catch (_error) {
          quizOutputEl.textContent =
            ">>> 実行に失敗しました。時間をおいて再度お試しください。";
        }
      });
    });

    submitQuizButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const code = this._editor ? this._editor.getValue().trim() : "";
        if (!problemId) {
          showFeedback(
            "問題が選択されていません",
            "クイズセットから問題を選択してから提出してください。",
            false
          );
          return;
        }

        try {
          const result = await quizPlayApi.submit({
            problemId,
            submittedCode: code,
          });

          const isCorrect = Boolean(result?.isCorrect);
          const message =
            result?.message || (isCorrect ? "正解です" : "不正解です");

          showFeedback(
            isCorrect ? "正解です！" : "結果",
            message,
            isCorrect
          );
        } catch (_error) {
          showFeedback(
            "提出に失敗しました",
            "時間をおいて再度お試しください。",
            false
          );
        }
      });
    });

    // v1ではヒント/正解は固定文言のまま簡易に残しておく
    viewAnswerButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (sampleAnswer) {
          showFeedback("正解と解説", sampleAnswer, true);
          return;
        }
        showFeedback(
          "正解と解説",
          "このバージョンでは模範解答は表示されません。提出結果を参考に改善してみましょう。",
          false
        );
      });
    });

    hintV2Buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        showFeedback(
          "ヒント",
          "問題文や既存コードのコメントをもう一度よく読み、何が求められているか整理してみましょう。",
          false
        );
      });
    });
  },
  unmount() {
    const root = QuizPlayView.getRoot();
    if (root) root.innerHTML = "";
  },
};
