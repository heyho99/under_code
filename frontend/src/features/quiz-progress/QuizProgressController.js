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

    // 日毎の取り組み数（直近 N 日分のダミーデータ）
    const canvas = root && root.querySelector("#js-activity-chart");
    const rangeRoot = root && root.querySelector("[data-activity-range]");
    const totalEl = root && root.querySelector("#js-activity-range-total");

    const updateTotal = (values) => {
      if (!totalEl) return;
      const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
      totalEl.textContent = `${sum} 問`;
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
        const values = [];

        activities.forEach((item) => {
          const d = new Date(item.date);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          labels.push(label);
          values.push(Number(item.count) || 0);
        });

        return { labels, values };
      };

      const maxDays = baseActivities.length || 0;
      const baseData = buildDailyData(baseActivities);

      const applyRange = (range) => {
        let labels = [];
        let values = [];

        if (!maxDays) {
          labels = [];
          values = [];
        } else if (range === "all") {
          labels = baseData.labels.slice();
          values = baseData.values.slice();
        } else {
          const days = Number(range) || maxDays;
          const safeDays = Math.min(maxDays, Math.max(1, days));
          const startIndex = Math.max(0, maxDays - safeDays);
          labels = baseData.labels.slice(startIndex);
          values = baseData.values.slice(startIndex);
        }

        renderActivityChart(canvas, { labels, values, label: "日毎の正解数" });
        updateTotal(values);
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
