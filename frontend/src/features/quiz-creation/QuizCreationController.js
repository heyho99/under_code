import { QuizCreationView } from "./QuizCreationView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizCreationApi } from "../../core/api/quizCreationApi.js";

export const QuizCreationController = {
  mount() {
    const root = QuizCreationView.getRoot();
    QuizCreationView.render(root);
    updateHeader(QuizCreationView);
    activateSection(QuizCreationView.key);

    if (!root) {
      return;
    }

    const steps = root.querySelectorAll("[data-step]");
    const stepNextButtons = root.querySelectorAll(".js-step-next");
    const stepPrevButtons = root.querySelectorAll(".js-step-prev");
    const openQuizListButtons = root.querySelectorAll(".js-open-quiz-list");
    const quizCounterButtons = root.querySelectorAll(".quiz-counter-btn");
    const generateQuizButton = root.querySelector(".js-generate-quiz");
    const wizardStepItems = root.querySelectorAll(".wizard-step-item");
    const confirmationCountEls = root.querySelectorAll("[data-summary-count]");

    let sourceId = null;

    function setStep(stepNumber) {
      // 右側のコンテンツ切り替え
      steps.forEach((stepEl) => {
        const value = Number(stepEl.dataset.step);
        stepEl.classList.toggle("step--active", value === stepNumber);
      });

      // 左側サイドバーの切り替え
      wizardStepItems.forEach((item) => {
        const target = Number(item.dataset.stepTarget);
        item.classList.toggle("wizard-step-item--active", target === stepNumber);
      });
    }

    function setActiveTreeRow(row) {
      const allRows = root.querySelectorAll(".tree-node__row");
      allRows.forEach((r) => r.classList.remove("tree-node__row--active"));
      if (row) {
        row.classList.add("tree-node__row--active");
      }
    }

    function updateConfirmationSummary() {
      let totalCount = 0;

      if (confirmationCountEls.length > 0) {
        const typeRows = root.querySelectorAll(".quiz-type-row");
        typeRows.forEach((row) => {
          const type = row.dataset.quizType;
          const valueEl = row.querySelector(".quiz-counter-value");
          if (!type || !valueEl) return;
          const count = Number(valueEl.dataset.count || "0");
          
          // 合計に加算
          totalCount += count;

          const targetEl = root.querySelector(`[data-summary-count="${type}"]`);
          if (targetEl) {
            targetEl.textContent = `${count}問`;
          }
        });
      }

      // 合計数を表示更新
      const totalCountEl = root.querySelector("[data-total-count]");
      if (totalCountEl) {
        totalCountEl.textContent = String(totalCount);
      }
    }

    async function ensureSourceUploaded() {
      if (sourceId !== null) {
        return sourceId;
      }
      try {
        const res = await quizCreationApi.uploadMockSource();
        if (res && typeof res.sourceId === "number") {
          sourceId = res.sourceId;
          return sourceId;
        }
      } catch (error) {
        if (typeof window !== "undefined" && window.alert) {
          window.alert(error.message || "プロジェクトのアップロードに失敗しました。");
        }
      }
      return null;
    }
    stepNextButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const next = Number(btn.dataset.nextStep);
        if (!next) return;
        if (next === 2) {
          const uploadedSourceId = await ensureSourceUploaded();
          if (!uploadedSourceId) {
            return;
          }
        }
        if (next === 3) {
          updateConfirmationSummary();
        }
        setStep(next);
      });
    });

    stepPrevButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const prev = Number(btn.dataset.prevStep);
        if (!prev) return;
        setStep(prev);
      });
    });

    openQuizListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/quiz-set-list");
      });
    });

    quizCounterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".quiz-type-row");
        if (!row) return;
        const valueEl = row.querySelector(".quiz-counter-value");
        if (!valueEl) return;

        const current = Number(valueEl.dataset.count || "0");
        const delta = Number(btn.dataset.delta || "0");
        let next = current + delta;
        if (next < 0) {
          next = 0;
        }

        valueEl.dataset.count = String(next);
        valueEl.textContent = `${next}問`;
      });
    });

    if (generateQuizButton) {
      generateQuizButton.addEventListener("click", async () => {
        if (sourceId === null) {
          const uploadedSourceId = await ensureSourceUploaded();
          if (!uploadedSourceId) {
            return;
          }
        }

        const titleInput = root.querySelector("[data-quiz-title]");
        const title =
          (titleInput && titleInput.value && titleInput.value.trim()) ||
          "Untitled Quiz";

        const typeRows = root.querySelectorAll(".quiz-type-row");
        let syntaxCount = 0;

        typeRows.forEach((row) => {
          const type = row.dataset.quizType;
          const valueEl = row.querySelector(".quiz-counter-value");
          if (!type || !valueEl) return;
          const count = Number(valueEl.dataset.count || "0");
          if (type === "basic") {
            syntaxCount = count;
          }
        });

        try {
          await quizCreationApi.generateQuiz({
            sourceId,
            title,
            problemCounts: {
              syntax: syntaxCount,
            },
          });
          navigate("#/quiz-set-list");
        } catch (error) {
          if (typeof window !== "undefined" && window.alert) {
            window.alert(error.message || "クイズの作成に失敗しました。");
          }
        }
      });
    }

    setStep(1);
  },
  unmount() {
    const root = QuizCreationView.getRoot();
    if (root) root.innerHTML = "";
  },
};
