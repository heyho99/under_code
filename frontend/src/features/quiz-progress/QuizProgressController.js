import { QuizProgressView, CATEGORY_CONFIG } from "./QuizProgressView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { renderActivityChart } from "../../ui/components/ActivityChart.js";
import { renderCompletionDonut } from "../../ui/components/CompletionDonut.js";
import { dashboardApi } from "../../core/api/dashboardApi.js";

export const QuizProgressController = {
  async mount() {
    const root = QuizProgressView.getRoot();
    QuizProgressView.render(root);
    updateHeader(QuizProgressView);
    activateSection(QuizProgressView.key);

    // 全体完了率ドーナツチャート
    const overallCanvas = root && root.querySelector("#js-overall-progress-chart");
    const overallPercentEl = root && root.querySelector("#js-overall-progress-percent");
    const overallMetaEl = root && root.querySelector("#js-overall-progress-meta");
    const overallSolvedMetaEl = root && root.querySelector("#js-overall-solved-meta");

    if (overallCanvas && overallPercentEl && overallMetaEl) {
      try {
        const summary = await dashboardApi.getSummary();
        const totalQuestions = Number(summary?.totalProblems) || 0;
        const attemptedQuestions = Number(summary?.attemptedProblems) || 0;
        const solvedQuestions = Number(summary?.solvedProblems) || 0;

        renderCompletionDonut(overallCanvas, {
          completed: attemptedQuestions,
          total: totalQuestions,
          percentElement: overallPercentEl,
          metaElement: overallMetaEl,
          completedLabel: "取り組み済み",
          remainingLabel: "未挑戦",
          metaPrefix: "取り組み",
        });

        if (overallSolvedMetaEl) {
          overallSolvedMetaEl.textContent = `正解 ${solvedQuestions} / ${totalQuestions} 問`;
        }
      } catch (_error) {
        overallPercentEl.textContent = "0%";
        overallMetaEl.textContent = "データを取得できませんでした";
        if (overallSolvedMetaEl) {
          overallSolvedMetaEl.textContent = "";
        }
      }
    }

    // タイプ別・カテゴリ別の進捗リスト
    const categoryList = root && root.querySelector("#js-category-list");
    if (categoryList) {
      try {
        const categories = await dashboardApi.getCategories();
        const statsByCategory = {};

        categories.forEach((item) => {
          if (!item || !item.category) return;
          const total = Number(item.count) || 0;
          const attempted = Number(item.attempted) || 0;
          const solved = Number(item.solved) || 0;
          const attemptedRate = Number(item.attemptedRate) || 0;
          const solvedRate = Number(item.solvedRate) || 0;

          statsByCategory[item.category] = {
            total,
            attempted,
            solved,
            attemptedRate,
            solvedRate,
          };
        });

        const items = categoryList.querySelectorAll("[data-category]");
        items.forEach((li) => {
          const key = li.getAttribute("data-category");
          if (!key) return;

          // coming soon カテゴリはスキップ
          if (CATEGORY_CONFIG[key]?.comingSoon) return;

          const stat = statsByCategory[key] || { total: 0, attempted: 0, solved: 0, attemptedRate: 0, solvedRate: 0 };

          const metaEl = li.querySelector(".list__meta");
          const attemptedBarEl = li.querySelector(".progress__bar--attempted");
          const solvedBarEl = li.querySelector(".progress__bar--solved");

          if (metaEl) {
            metaEl.textContent = `取り組み ${stat.attempted} / ${stat.total} 問 ・ 正解 ${stat.solved} / ${stat.total} 問`;
          }

          if (attemptedBarEl) {
            attemptedBarEl.style.width = `${stat.attemptedRate}%`;
          }
          if (solvedBarEl) {
            solvedBarEl.style.width = `${stat.solvedRate}%`;
          }
        });
      } catch (_error) {
        const items = categoryList.querySelectorAll("[data-category]");
        items.forEach((li) => {
          const key = li.getAttribute("data-category");
          // coming soon カテゴリはスキップ
          if (CATEGORY_CONFIG[key]?.comingSoon) return;

          const metaEl = li.querySelector(".list__meta");
          const attemptedBarEl = li.querySelector(".progress__bar--attempted");
          const solvedBarEl = li.querySelector(".progress__bar--solved");

          if (metaEl) {
            metaEl.textContent = "データを取得できませんでした";
          }

          if (attemptedBarEl) {
            attemptedBarEl.style.width = "0%";
          }
          if (solvedBarEl) {
            solvedBarEl.style.width = "0%";
          }
        });
      }
    }

    // 言語別の進捗リスト（動的に増える）
    const languageList = root && root.querySelector("#js-language-list");
    if (languageList) {
      try {
        const languages = await dashboardApi.getLanguages();
        const items = Array.isArray(languages) ? languages : [];
        languageList.innerHTML = "";

        if (items.length === 0) {
          languageList.innerHTML = `
            <li class="list__item">
              <div class="list__primary">
                <span class="list__title">まだデータがありません</span>
                <span class="list__meta">提出をすると言語別の統計が表示されます。</span>
              </div>
            </li>
          `;
        } else {
          items.forEach((row) => {
            const lang = String(row?.language || "");
            if (!lang) return;
            const attempted = Number(row?.attempted) || 0;
            const solved = Number(row?.solved) || 0;
            const total = Number(row?.total) || 0;
            const attemptedRate = total > 0 ? Math.round((attempted / total) * 100) : 0;
            const solvedRate = total > 0 ? Math.round((solved / total) * 100) : 0;

            const li = document.createElement("li");
            li.className = "list__item";
            li.innerHTML = `
              <div class="list__primary">
                <span class="list__title">${lang}</span>
                <span class="list__meta">取り組み ${attempted} / ${total} 問 ・ 正解 ${solved} / ${total} 問</span>
              </div>
              <div class="progress-stack">
                <div class="progress-stack__row">
                  <span class="progress-stack__label">取り組み</span>
                  <div class="progress">
                    <div class="progress__bar progress__bar--attempted" style="width: ${attemptedRate}%"></div>
                  </div>
                </div>
                <div class="progress-stack__row">
                  <span class="progress-stack__label">正解</span>
                  <div class="progress">
                    <div class="progress__bar progress__bar--solved" style="width: ${solvedRate}%"></div>
                  </div>
                </div>
              </div>
            `;
            languageList.appendChild(li);
          });
        }
      } catch (_error) {
        languageList.innerHTML = `
          <li class="list__item">
            <div class="list__primary">
              <span class="list__title">言語別データを取得できませんでした</span>
              <span class="list__meta">時間をおいて再度お試しください。</span>
            </div>
          </li>
        `;
      }
    }

    // 日毎の取り組み数（提出数 / 正解数）
    const canvas = root && root.querySelector("#js-activity-chart");
    const rangeRoot = root && root.querySelector("[data-activity-range]");
    const submissionsTotalEl = root && root.querySelector("#js-activity-range-submissions-total");
    const solvedTotalEl = root && root.querySelector("#js-activity-range-solved-total");

    const sumValues = (values) =>
      (values || []).reduce((acc, v) => acc + (Number(v) || 0), 0);

    const updateTotals = ({ submissionsValues, solvedValues }) => {
      const submissionsSum = sumValues(submissionsValues);
      const solvedSum = sumValues(solvedValues);

      if (submissionsTotalEl) {
        submissionsTotalEl.textContent = `${submissionsSum} 回`;
      }
      if (solvedTotalEl) {
        solvedTotalEl.textContent = `${solvedSum} 回`;
      }
    };

    if (canvas) {
      const defaultDays = "all";
      let baseActivities = [];

      try {
        baseActivities = await dashboardApi.getActivities(30);
      } catch (_error) {
        baseActivities = [];
      }

      const buildDailyData = (activities) => {
        const labels = [];
        const submissionsValues = [];
        const solvedValues = [];

        activities.forEach((item) => {
          const d = new Date(item.date);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          labels.push(label);
          submissionsValues.push(Number(item.submissionsCount) || 0);
          solvedValues.push(Number(item.solvedCount) || 0);
        });

        return { labels, submissionsValues, solvedValues };
      };

      const maxDays = baseActivities.length || 0;
      const baseData = buildDailyData(baseActivities);

      const applyRange = (range) => {
        let labels = [];
        let submissionsValues = [];
        let solvedValues = [];

        if (!maxDays) {
          labels = [];
          submissionsValues = [];
          solvedValues = [];
        } else if (range === "all") {
          labels = baseData.labels.slice();
          submissionsValues = baseData.submissionsValues.slice();
          solvedValues = baseData.solvedValues.slice();
        } else {
          const days = Number(range) || maxDays;
          const safeDays = Math.min(maxDays, Math.max(1, days));
          const startIndex = Math.max(0, maxDays - safeDays);
          labels = baseData.labels.slice(startIndex);
          submissionsValues = baseData.submissionsValues.slice(startIndex);
          solvedValues = baseData.solvedValues.slice(startIndex);
        }

        renderActivityChart(canvas, {
          labels,
          datasets: [
            {
              label: "提出数",
              data: submissionsValues,
              backgroundColor: "rgba(37, 99, 235, 0.85)",
              maxBarThickness: 20,
            },
            {
              label: "正解数",
              data: solvedValues,
              backgroundColor: "rgba(34, 197, 94, 0.85)",
              maxBarThickness: 20,
            },
          ],
        });

        updateTotals({ submissionsValues, solvedValues });
      };

      applyRange(defaultDays);

      if (rangeRoot) {
        rangeRoot.addEventListener("click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;

          const button = target.closest("[data-range]");
          if (!button) return;

          const range = button.getAttribute("data-range") || defaultDays;

          const items = rangeRoot.querySelectorAll(".segmented__item");
          items.forEach((item) => {
            item.classList.toggle(
              "segmented__item--active",
              item === button
            );
          });

          applyRange(range);
        });
      }
    }
  },
  unmount() {
    const root = QuizProgressView.getRoot();
    if (root) root.innerHTML = "";
  },
};
