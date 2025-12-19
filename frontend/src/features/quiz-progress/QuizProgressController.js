import { QuizProgressView } from "./QuizProgressView.js";
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

    if (overallCanvas && overallPercentEl && overallMetaEl) {
      try {
        const summary = await dashboardApi.getSummary();
        const totalQuestions = Number(summary?.totalProblems) || 0;
        const completedQuestions = Number(summary?.completedProblems) || 0;
        const percentage =
          totalQuestions > 0
            ? Math.round((completedQuestions / totalQuestions) * 100)
            : 0;

        overallPercentEl.textContent = `${percentage}%`;
        overallMetaEl.textContent = `完了 ${completedQuestions} / ${totalQuestions} 問`;

        renderCompletionDonut(overallCanvas, {
          completed: completedQuestions,
          total: totalQuestions,
          percentElement: overallPercentEl,
          metaElement: overallMetaEl,
        });
      } catch (_error) {
        overallPercentEl.textContent = "0%";
        overallMetaEl.textContent = "データを取得できませんでした";
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
          const solved = Number(item.solved) || 0;
          const rawRate =
            item.rate !== undefined && item.rate !== null ? Number(item.rate) : null;
          const rate =
            rawRate !== null && !Number.isNaN(rawRate)
              ? Math.max(0, Math.min(100, Math.round(rawRate)))
              : total > 0
              ? Math.round((solved / total) * 100)
              : 0;

          statsByCategory[item.category] = {
            total,
            solved,
            rate,
          };
        });

        const items = categoryList.querySelectorAll("[data-category]");
        items.forEach((li) => {
          const key = li.getAttribute("data-category");
          if (!key) return;
          const stat = statsByCategory[key] || { total: 0, solved: 0, rate: 0 };

          const metaEl = li.querySelector(".list__meta");
          const barEl = li.querySelector(".progress__bar");

          if (metaEl) {
            metaEl.textContent = `${stat.solved} / ${stat.total} 問完了 ・ 完了率 ${stat.rate}%`;
          }

          if (barEl) {
            barEl.style.width = `${stat.rate}%`;
          }
        });
      } catch (_error) {
        const items = categoryList.querySelectorAll("[data-category]");
        items.forEach((li) => {
          const metaEl = li.querySelector(".list__meta");
          const barEl = li.querySelector(".progress__bar");

          if (metaEl) {
            metaEl.textContent = "データを取得できませんでした";
          }

          if (barEl) {
            barEl.style.width = "0%";
          }
        });
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
