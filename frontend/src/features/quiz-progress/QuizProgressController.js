import { QuizProgressView } from "./QuizProgressView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";
import { renderActivityChart } from "../../ui/components/ActivityChart.js";

export const QuizProgressController = {
  mount() {
    const root = QuizProgressView.getRoot();
    QuizProgressView.render(root);
    updateHeader(QuizProgressView);
    activateSection(QuizProgressView.key);

    // 日毎の取り組み数（直近30日分のダミーデータ）
    const canvas = root && root.querySelector("#js-activity-chart");
    if (canvas) {
      const today = new Date();
      const labels = [];
      const values = [];

      // 古い日付から新しい日付の順で 30 日分を生成
      for (let i = 29; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        labels.push(label);

        // ダミーの取り組み数（0〜6 問程度）
        const value = Math.floor(Math.random() * 7);
        values.push(value);
      }

      renderActivityChart(canvas, { labels, values, label: "日毎の正解数" });
    }
  },
  unmount() {
    const root = QuizProgressView.getRoot();
    if (root) root.innerHTML = "";
  },
};
