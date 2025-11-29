import { QuizListView } from "./QuizListView.js";
import { navigate } from "../../router/router.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { quizSetsApi } from "../../core/api/quizSetsApi.js";

export const QuizListController = {
  async mount() {
    const root = QuizListView.getRoot();
    QuizListView.render(root);
    updateHeader(QuizListView);
    activateSection(QuizListView.key);

    if (!root) {
      return;
    }

    const listEl = root.querySelector("[data-quiz-set-list]");

    if (listEl) {
      try {
        const quizSets = await quizSetsApi.getQuizSets();
        listEl.innerHTML = "";

        quizSets.forEach((quizSet) => {
          if (!quizSet) return;

          const li = document.createElement("li");
          li.className = "list__item quiz-set-item";
          li.setAttribute("data-quiz-set-id", String(quizSet.quizSetId));

          const total = Number(quizSet.total ?? 0);
          const completed = Number(quizSet.completed ?? 0);
          const rawRate =
            quizSet.progressRate !== undefined && quizSet.progressRate !== null
              ? Number(quizSet.progressRate)
              : null;
          const rate =
            rawRate !== null && !Number.isNaN(rawRate)
              ? Math.max(0, Math.min(100, Math.round(rawRate)))
              : total > 0
              ? Math.round((completed / total) * 100)
              : 0;

          li.innerHTML = `
            <div class="list__row quiz-set-item__row">
              <div class="list__primary">
                <span class="list__title"></span>
                <span class="list__meta"></span>
              </div>
              <div class="list__actions">
                <button class="primary-btn js-open-quiz-set">クイズを選ぶ</button>
              </div>
            </div>
            <div class="quiz-set-item__meta">
              <span class="js-quiz-set-last-tried"></span>
              <span class="quiz-set-item__meta-separator">・</span>
              <span class="js-quiz-set-progress"></span>
            </div>
            <div class="progress">
              <div class="progress__bar"></div>
            </div>
          `;

          const titleEl = li.querySelector(".list__title");
          if (titleEl) {
            titleEl.textContent =
              quizSet.title || `クイズセット #${quizSet.quizSetId}`;
          }

          const metaEl = li.querySelector(".list__meta");
          if (metaEl) {
            metaEl.textContent = quizSet.description || "";
          }

          const lastTriedEl = li.querySelector(".js-quiz-set-last-tried");
          if (lastTriedEl) {
            lastTriedEl.textContent = "前回挑戦: -";
          }

          const progressTextEl = li.querySelector(".js-quiz-set-progress");
          if (progressTextEl) {
            if (total > 0) {
              progressTextEl.textContent = `完了 ${completed} / ${total} 問 ・ 完了率: ${rate}%`;
            } else {
              progressTextEl.textContent = `完了率: ${rate}%`;
            }
          }

          const barEl = li.querySelector(".progress__bar");
          if (barEl) {
            barEl.style.width = `${rate}%`;
          }

          listEl.appendChild(li);
        });
      } catch (_error) {
        listEl.innerHTML = `
          <li class="list__item">
            <div class="list__primary">
              <span class="list__title">クイズセットを取得できませんでした</span>
              <span class="list__meta">時間をおいて再度お試しください。</span>
            </div>
          </li>
        `;
      }
    }

    root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest(".js-open-quiz-set");
      if (!button) return;

      const item = button.closest(".quiz-set-item");
      const quizSetIdAttr = item && item.getAttribute("data-quiz-set-id");

      if (quizSetIdAttr) {
        try {
          if (typeof window !== "undefined" && window.sessionStorage) {
            window.sessionStorage.setItem("selectedQuizSetId", quizSetIdAttr);
          }
        } catch {
        }
      }

      navigate("#/problem-list");
    });
  },
  unmount() {
    const root = QuizListView.getRoot();
    if (root) root.innerHTML = "";
  },
};
