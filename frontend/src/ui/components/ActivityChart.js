export function renderActivityChart(canvas, { labels, values, label = "日毎の正解数" } = {}) {
  if (!canvas) return;

  const hasChartGlobal = typeof window !== "undefined" && typeof window.Chart !== "undefined";
  // Chart.js が読み込まれていない場合は何もしない
  if (!hasChartGlobal) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 既存インスタンスがあれば破棄（同じ canvas に再描画する場合に備えて）
  if (canvas._chartInstance && typeof canvas._chartInstance.destroy === "function") {
    canvas._chartInstance.destroy();
  }

  const data = values || [];
  const chart = new window.Chart(ctx, {
    type: "bar",
    data: {
      labels: labels || [],
      datasets: [
        {
          label,
          data,
          backgroundColor: "rgba(37, 99, 235, 0.85)",
          borderRadius: 6,
          maxBarThickness: 32,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(209, 213, 219, 0.6)" },
          ticks: { stepSize: 1, font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const v = context.parsed.y;
              return `${v} 問`;
            },
          },
        },
      },
    },
  });

  canvas._chartInstance = chart;
}
