import { QuizSetDetailView } from "./QuizSetDetailView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizSetsApi } from "../../core/api/quizSetsApi.js";

const LANGUAGE_DISPLAY = {
  python3: { icon: "code", label: "Python", color: "#3776ab" },
  javascript: { icon: "javascript", label: "JavaScript", color: "#f7df1e" },
  go: { icon: "code", label: "Go", color: "#00add8" },
};

function getSelectedQuizSetId() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const raw = window.sessionStorage.getItem("selectedQuizSetId");
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

function setSelectedProblemId(problemId) {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem("selectedProblemId", String(problemId));
    }
  } catch {
  }
}

export const QuizSetDetailController = {
  async mount() {
    const root = QuizSetDetailView.getRoot();
    QuizSetDetailView.render(root);
    updateHeader(QuizSetDetailView);
    activateSection(QuizSetDetailView.key);

    if (!root) {
      return;
    }

    const gridEl = root.querySelector("[data-quiz-problem-list]");

    if (gridEl) {
      try {
        const quizSetId = getSelectedQuizSetId();
        if (quizSetId === null) {
          gridEl.innerHTML = `
            <p class="quiz-grid__empty">クイズセットが選択されていません。</p>
          `;
        } else {
          const detail = await quizSetsApi.getQuizSetDetail(quizSetId);
          const problems = Array.isArray(detail && detail.problems)
            ? detail.problems
            : [];

          if (problems.length === 0) {
            gridEl.innerHTML = `
              <p class="quiz-grid__empty">このクイズセットには問題が登録されていません。</p>
            `;
          } else {
            gridEl.innerHTML = "";
            problems.forEach((problem, index) => {
              if (!problem) return;

              const article = document.createElement("article");
              article.className = "quiz-grid__item";
              article.setAttribute(
                "data-problem-id",
                String(problem.problemId)
              );

              const isSolved = Boolean(problem.isSolved);
              const lang = problem.defaultLanguage || "python3";
              const langInfo = LANGUAGE_DISPLAY[lang] || LANGUAGE_DISPLAY.python3;
              const submissionCount = Number(problem.submissionCount) || 0;
              const lastSubmittedAt = problem.lastSubmittedAt || null;

              let lastSubmittedText = "未提出";
              if (lastSubmittedAt) {
                const d = new Date(lastSubmittedAt);
                lastSubmittedText = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              }

              article.innerHTML = `
                <div class="quiz-grid__icon">Q${index + 1}</div>
                <div class="quiz-grid__content">
                  <div class="quiz-grid__header">
                    <h3 class="quiz-grid__title"></h3>
                    <div class="quiz-grid__actions">
                      <button class="primary-btn${
                        isSolved ? " primary-btn--outline" : ""
                      } js-open-quiz-play">
                        ${isSolved ? "復習する" : "挑戦する"}
                      </button>
                    </div>
                  </div>
                  <div class="quiz-grid__footer">
                    <span class="quiz-grid__lang-badge" style="--lang-color: ${langInfo.color}">
                      ${langInfo.label}
                    </span>
                    <div class="quiz-grid__stats">
                      <span class="quiz-grid__stat">提出 ${submissionCount}回</span>
                      <span class="quiz-grid__stat">最終 ${lastSubmittedText}</span>
                      <span class="quiz-grid__stat quiz-grid__status ${isSolved ? 'quiz-grid__status--solved' : ''}">
                        ${isSolved ? "完了済み" : "未完了"}
                      </span>
                    </div>
                  </div>
                </div>
              `;

              const titleEl = article.querySelector(".quiz-grid__title");
              if (titleEl) {
                titleEl.textContent =
                  problem.title || `問題 #${problem.problemId}`;
              }

              gridEl.appendChild(article);
            });
          }
        }
      } catch (_error) {
        gridEl.innerHTML = `
          <p class="quiz-grid__empty">クイズ一覧を取得できませんでした。</p>
        `;
      }
    }

    const backToQuizSetListButtons = root.querySelectorAll(
      ".js-back-to-quiz-set-list"
    );

    backToQuizSetListButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("#/quiz-set-list");
      });
    });

    const openQuizPlayButtons = root.querySelectorAll(".js-open-quiz-play");

    openQuizPlayButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".quiz-grid__item");
        const problemIdAttr =
          item && item.getAttribute("data-problem-id");
        if (problemIdAttr) {
          const problemId = Number(problemIdAttr);
          if (!Number.isNaN(problemId)) {
            setSelectedProblemId(problemId);
          }
        }
        navigate("#/quiz-play");
      });
    });
  },
  unmount() {
    const root = QuizSetDetailView.getRoot();
    if (root) root.innerHTML = "";
  },
};
