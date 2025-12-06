import { QuizCreationView } from "./QuizCreationView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizCreationApi } from "../../core/api/quizCreationApi.js";
import {
  readFilesFromInput,
  calculateTotalQuestionsFromFiles,
  buildFilesForApi,
} from "./QuizCreationLogic.js";

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
    const generateQuizButton = root.querySelector(".js-generate-quiz");
    const wizardStepItems = root.querySelectorAll(".wizard-step-item");
    const fileInput = root.querySelector("[data-file-input]");
    const fileSelectButton = root.querySelector("[data-file-select-button]");

    let uploadedFiles = [];

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

    async function handleFilesSelected(fileList) {
      try {
        uploadedFiles = await readFilesFromInput(fileList);
      } catch (error) {
        if (typeof window !== "undefined" && window.alert) {
          window.alert(error.message || "ファイルの読み込みに失敗しました。");
        }
      }
    }

    if (fileSelectButton && fileInput) {
      fileSelectButton.addEventListener("click", (event) => {
        event.preventDefault();
        fileInput.click();
      });

      fileInput.addEventListener("change", (event) => {
        const target = event.target;
        if (!target || !target.files) {
          uploadedFiles = [];
          return;
        }
        handleFilesSelected(target.files);
      });
    }
    stepNextButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const next = Number(btn.dataset.nextStep);
        if (!next) return;
        if (next === 2) {
          if (!uploadedFiles || uploadedFiles.length === 0) {
            if (typeof window !== "undefined" && window.alert) {
              window.alert("ファイルを選択してください。");
            }
            return;
          }
        }
        if (next === 3) {
          const titleInput = root.querySelector("[data-quiz-title]");
          const descriptionInput = root.querySelector("[data-quiz-description]");
          const titleReview = root.querySelector("[data-quiz-title-review]");
          const descriptionReview = root.querySelector("[data-quiz-description-review]");

          const rawTitle =
            (titleInput && titleInput.value && titleInput.value.trim()) || "";
          const safeTitle = rawTitle || "Untitled Quiz";

          if (titleReview) {
            titleReview.value = safeTitle;
          }
          if (descriptionReview && descriptionInput) {
            descriptionReview.value = descriptionInput.value || "";
          }

          const totalCount = calculateTotalQuestionsFromFiles(uploadedFiles);
          const totalCountEl = root.querySelector("[data-total-count]");
          if (totalCountEl) {
            totalCountEl.textContent = String(totalCount);
          }
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

    if (generateQuizButton) {
      generateQuizButton.addEventListener("click", async () => {
        if (!uploadedFileContents || uploadedFileContents.length === 0) {
          if (typeof window !== "undefined" && window.alert) {
            window.alert("ファイルが選択されていません。");
          }
          return;
        }

        const titleInput = root.querySelector("[data-quiz-title]");
        const title =
          (titleInput && titleInput.value && titleInput.value.trim()) ||
          "Untitled Quiz";

        const syntaxCount = calculateTotalQuestionsFromFiles(uploadedFiles);
        if (syntaxCount <= 0) {
          if (typeof window !== "undefined" && window.alert) {
            window.alert("有効なファイルが選択されていません。");
          }
          return;
        }
        const filesForApi = buildFilesForApi(uploadedFiles);

        try {
          await quizCreationApi.generateQuiz({
            title,
            files: filesForApi,
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
