import { QuizProgressView } from "./QuizProgressView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { renderActivityChart } from "../../ui/components/ActivityChart.js";

export const QuizProgressController = {
  mount() {
    const root = QuizProgressView.getRoot();
    QuizProgressView.render(root);
    updateHeader(QuizProgressView);
    activateSection(QuizProgressView.key);

    // 日毎の取り組み数（直近 N 日分のダミーデータ）
    const canvas = root && root.querySelector("#js-activity-chart");
    const rangeRoot = root && root.querySelector("[data-activity-range]");
    const totalEl = root && root.querySelector("#js-activity-range-total");

    const buildDailyData = (days) => {
      const today = new Date();
      const labels = [];
      const values = [];

      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        labels.push(label);

        // ダミーの取り組み数（0〜6 問程度）
        const value = Math.floor(Math.random() * 7);
        values.push(value);
      }

      return { labels, values };
    };

    const updateTotal = (values) => {
      if (!totalEl) return;
      const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
      totalEl.textContent = `${sum} 問`;
    };

    if (canvas) {
      const defaultDays = "all";
      const maxDays = 30;
      const baseData = buildDailyData(maxDays);

      const applyRange = (range) => {
        let labels;
        let values;

        if (range === "all") {
          labels = baseData.labels.slice();
          values = baseData.values.slice();
        } else {
          const days = Number(range) || maxDays;
          const safeDays = Math.min(maxDays, Math.max(1, days));
          const startIndex = maxDays - safeDays;
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
