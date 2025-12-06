import { QuizCreationView } from "./QuizCreationView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizCreationApi } from "../../core/api/quizCreationApi.js";

const CHARS_PER_QUESTION = 500;

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

    function calculateQuestionsFromContent(content) {
      if (!content) {
        return 0;
      }
      const length = content.length;
      if (length <= 0) {
        return 0;
      }
      const questions = Math.ceil(length / CHARS_PER_QUESTION);
      return questions < 1 ? 1 : questions;
    }

    function calculateTotalQuestionsFromFiles(files) {
      if (!files || files.length === 0) {
        return 0;
      }
      return files.reduce((sum, file) => {
        return sum + calculateQuestionsFromContent(file.content);
      }, 0);
    }

    function readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            resolve("");
          }
        };
        reader.onerror = () => {
          reject(reader.error || new Error("ファイルの読み込みに失敗しました。"));
        };
        reader.readAsText(file);
      });
    }

    async function handleFilesSelected(fileList) {
      const files = Array.from(fileList || []);
      if (files.length === 0) {
        uploadedFiles = [];
        return;
      }

      try {
        const contents = await Promise.all(files.map((file) => readFileAsText(file)));
        uploadedFiles = files.map((file, index) => {
          return {
            fileName: file.name || `file-${index + 1}`,
            content: contents[index] || "",
          };
        });
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
        const filesForApi = uploadedFiles.map((file) => {
          const perFileSyntaxCount = calculateQuestionsFromContent(file.content);
          return {
            fileName: file.fileName,
            content: file.content,
            problemCounts: {
              syntax: perFileSyntaxCount,
            },
          };
        });

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
