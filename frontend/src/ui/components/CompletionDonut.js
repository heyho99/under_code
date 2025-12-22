export function renderCompletionDonut(
  canvas,
  {
    completed,
    total,
    percentElement,
    metaElement,
    completedLabel = "完了",
    remainingLabel = "未完了",
    metaPrefix = "完了",
  } = {}
) {
  if (!canvas) return;

  const hasChartGlobal =
    typeof window !== "undefined" && typeof window.Chart !== "undefined";
  if (!hasChartGlobal) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (canvas._chartInstance && typeof canvas._chartInstance.destroy === "function") {
    canvas._chartInstance.destroy();
  }

  const safeTotal = Math.max(0, Number(total) || 0);
  const safeCompleted = Math.min(
    safeTotal,
    Math.max(0, Number(completed) || 0)
  );
  const remaining = Math.max(0, safeTotal - safeCompleted);

  const percentage =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  if (percentElement) {
    percentElement.textContent = `${percentage}%`;
  }
  if (metaElement) {
    metaElement.textContent = `${metaPrefix} ${safeCompleted} / ${safeTotal} 問`;
  }

  const chart = new window.Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [completedLabel, remainingLabel],
      datasets: [
        {
          data: [safeCompleted, remaining],
          backgroundColor: [
            "rgba(37, 99, 235, 0.9)",
            "rgba(209, 213, 219, 0.8)",
          ],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      animation: {
        duration: 900,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const v = context.parsed;
              const label = context.label || "";
              return `${label}: ${v} 問`;
            },
          },
        },
      },
    },
  });

  canvas._chartInstance = chart;
}
