import { QuizPlayView } from "./QuizPlayView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizPlayApi } from "../../core/api/quizPlayApi.js";
import { createEditor } from "../../ui/components/CodeEditor/CodeEditorFactory.js";

const LANGUAGE_CONFIG = {
  python3: {
    tabName: "answer.py",
    footer: "Python 3.11 / FastAPI / uvicorn",
  },
  javascript: {
    tabName: "answer.js",
    footer: "Node.js 20 / JavaScript",
  },
  go: {
    tabName: "main.go",
    footer: "Go 1.21",
  },
};

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    const markdownEl = root.querySelector("[data-quiz-markdown]");
    const editorTabEl = root.querySelector("[data-editor-tab]");
    const editorFooterEl = root.querySelector("[data-editor-footer]");
    const testcaseSysinEl = root.querySelector("[data-testcase-sysin]");
    const testcaseExpectedEl = root.querySelector("[data-testcase-expected]");
    const testcaseLabelEl = root.querySelector("[data-testcase-label]");
    const testcasePrevBtn = root.querySelector(".js-testcase-prev");
    const testcaseNextBtn = root.querySelector(".js-testcase-next");
    let sampleAnswer = "";
    let testcases = [];
    let currentTestcaseIndex = 0;

    // testcase 表示を更新する関数
    const updateTestcasePreview = (idx) => {
      if (!testcases.length) return;
      currentTestcaseIndex = idx;
      const tc = testcases[idx] || testcases[0];
      if (testcaseSysinEl) {
        testcaseSysinEl.textContent = JSON.stringify(tc.sysin, null, 2);
      }
      if (testcaseExpectedEl) {
        testcaseExpectedEl.textContent = JSON.stringify(tc.expected, null, 2);
      }
      if (testcaseLabelEl) {
        testcaseLabelEl.textContent = `${idx + 1} / ${testcases.length}`;
      }
    };

    const problemId = getSelectedProblemId();

    // エディタの初期化（問題取得後に starterCode を設定するため、ここでは空で初期化）
    if (editorContainer) {
      this._editor = createEditor({
        container: editorContainer,
        initialCode: "",
        // type: "cm6", // 必要に応じて "monaco" に変更
      });
    }

    // 問題から取得した言語を保持（実行・提出時に使用）
    let currentLanguage = "python3";

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
        const statement = detail?.statement || "";
        // カードサブタイトルにはカテゴリを表示（重複を避ける）
        if (descriptionEl) {
          descriptionEl.textContent = detail?.category || "";
        }
        if (markdownEl) {
          // 問題本文を表示
          markdownEl.innerHTML = statement;
        }
        sampleAnswer = detail?.sampleAnswer || "";

        // testcases を取得して表示
        testcases = detail?.testcases || [];
        if (testcases.length > 0) {
          // 初期表示（最初の testcase）
          updateTestcasePreview(0);
        }

        // starterCode をエディタに設定（設計書: BFF が言語別に付与）
        const starterCode = detail?.starterCode || "";
        if (this._editor && starterCode) {
          this._editor.setValue(starterCode);
        }

        // 問題の defaultLanguage を保持（実行・提出時に使用）
        currentLanguage = detail?.defaultLanguage || "python3";

        // 言語に応じてタブ名とフッターを更新
        const langConfig = LANGUAGE_CONFIG[currentLanguage] || LANGUAGE_CONFIG.python3;
        if (editorTabEl) {
          editorTabEl.textContent = langConfig.tabName;
        }
        if (editorFooterEl) {
          editorFooterEl.textContent = langConfig.footer;
        }
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
        <pre class="quiz-feedback__content"><code>${content}</code></pre>
      `;
    };

    backToQuizListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/problem-list");
      });
    });

    // testcase 前後ボタン
    if (testcasePrevBtn) {
      testcasePrevBtn.addEventListener("click", () => {
        if (testcases.length === 0) return;
        const newIdx = currentTestcaseIndex > 0 ? currentTestcaseIndex - 1 : testcases.length - 1;
        updateTestcasePreview(newIdx);
      });
    }
    if (testcaseNextBtn) {
      testcaseNextBtn.addEventListener("click", () => {
        if (testcases.length === 0) return;
        const newIdx = currentTestcaseIndex < testcases.length - 1 ? currentTestcaseIndex + 1 : 0;
        updateTestcasePreview(newIdx);
      });
    }

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
          const testcaseIndex = currentTestcaseIndex;
          const result = await quizPlayApi.executeCode({
            problemId,
            language: currentLanguage,
            code,
            testcaseIndex,
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
            language: currentLanguage,
            code,
          });

          const isCorrect = Boolean(result?.isCorrect);
          const details = result?.details || [];

          // テストケースごとの結果を HTML で構築
          let detailsHtml = "";
          if (details.length > 0) {
            detailsHtml = `<div class="submission-details">`;
            details.forEach((d, idx) => {
              const statusIcon = d.passed ? "check_circle" : "cancel";
              const statusClass = d.passed ? "submission-details__item--passed" : "submission-details__item--failed";
              detailsHtml += `
                <div class="submission-details__item ${statusClass}">
                  <div class="submission-details__header">
                    <span class="material-symbols-outlined">${statusIcon}</span>
                    <span>テストケース ${idx + 1}</span>
                    <span class="submission-details__status">${d.passed ? "合格" : "不合格"}</span>
                  </div>
                  <div class="submission-details__body">
                    <div class="submission-details__row">
                      <span class="submission-details__label">入力:</span>
                      <code class="submission-details__value">${escapeHtml(JSON.stringify(d.sysin))}</code>
                    </div>
                    <div class="submission-details__row">
                      <span class="submission-details__label">期待:</span>
                      <code class="submission-details__value">${escapeHtml(JSON.stringify(d.expected))}</code>
                    </div>
                    <div class="submission-details__row">
                      <span class="submission-details__label">出力:</span>
                      <code class="submission-details__value">${escapeHtml(d.stdout || "(なし)")}</code>
                    </div>
                  </div>
                </div>
              `;
            });
            detailsHtml += `</div>`;
          }

          const passedCount = details.filter(d => d.passed).length;
          const totalCount = details.length;
          const summaryMessage = `${passedCount} / ${totalCount} テストケース合格`;

          showFeedback(
            isCorrect ? "正解です！" : "不正解",
            `<p>${summaryMessage}</p>${detailsHtml}`,
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
