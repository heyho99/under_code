import { ProjectView } from "./views/ProjectView.js";
import { OverviewView } from "./views/OverviewView.js";
import { QuizDesignView } from "./views/QuizDesignView.js";
import { QuizProgressView } from "./views/QuizProgressView.js";
import { QuizListView } from "./views/QuizListView.js";
import { QuizSetDetailView } from "./views/QuizSetDetailView.js";
import { QuizPlayView } from "./views/QuizPlayView.js";

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");
  const titleEl = document.querySelector("[data-view-title]");
  const subtitleEl = document.querySelector("[data-view-subtitle]");
  const appShell = document.querySelector(".app-shell");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebarToggleIcon = document.querySelector(".sidebar-toggle__icon");

  const allViews = [
    ProjectView,
    OverviewView,
    QuizDesignView,
    QuizProgressView,
    QuizListView,
    QuizSetDetailView,
    QuizPlayView,
  ];

  const viewMap = allViews.reduce((map, view) => {
    map[view.key] = view;
    return map;
  }, {});

  // 初期レンダリング: 全ビュー
  allViews.forEach((view) => {
    if (typeof view.getRoot !== "function") return;
    const root = view.getRoot();
    if (!root) return;
    if (typeof view.render === "function") {
      view.render(root);
    }
  });

  // レンダリング後の DOM をもとに要素を取得
  const steps = document.querySelectorAll("[data-step]");
  const stepNextButtons = document.querySelectorAll(".js-step-next");
  const stepPrevButtons = document.querySelectorAll(".js-step-prev");
  const openQuizListButtons = document.querySelectorAll(".js-open-quiz-list");
  const openQuizPlayButtons = document.querySelectorAll(".js-open-quiz-play");
  const backToQuizListButtons = document.querySelectorAll(".js-back-to-quiz-list");
  const treeFolderRows = document.querySelectorAll(".js-tree-folder");
  const treeRows = document.querySelectorAll(".tree-node__row");
  const summaryTitleEl = document.querySelector("[data-summary-title]");
  const summaryBodyEl = document.querySelector("[data-summary-body]");
  const openQuizSetButtons = document.querySelectorAll(".js-open-quiz-set");
  const backToQuizSetListButtons = document.querySelectorAll(
    ".js-back-to-quiz-set-list"
  );
  const quizCounterButtons = document.querySelectorAll(".quiz-counter-btn");
  const treeCheckboxes = document.querySelectorAll(".tree-node__checkbox");
  const generateQuizButton = document.querySelector(".js-generate-quiz");
  const runCodeButtons = document.querySelectorAll(".js-run-code");
  const quizOutputEl = document.querySelector("[data-quiz-output]");
  const answerTextarea = document.querySelector(".code-editor-mock__textarea");

  const nodeSummaries = {
    app: {
      title: "app/",
      body:
        "アプリケーション本体のコードが入るルートフォルダの想定です。ルーティングやサービス層などの中心的な構造が配置されます。",
    },
    "app/api": {
      title: "app/api/",
      body:
        "エンドポイント定義を置くAPIレイヤの想定です。FastAPI の router やエンドポイントごとのハンドラがまとまります。",
    },
    "app/api/router.py": {
      title: "app/api/router.py",
      body:
        "API エンドポイントのルーティング定義を記述するモジュールの想定です。パスやHTTPメソッドごとのハンドラを登録します。",
    },
    "app/services": {
      title: "app/services/",
      body:
        "ユースケースやドメインロジックを実装するサービス層の想定です。ビジネスルールをここに集約し、API層から呼び出します。",
    },
    "app/services/service.py": {
      title: "app/services/service.py",
      body:
        "アプリケーションのユースケースをまとめて実装するサービスクラスの想定です。認証や業務ロジックをメソッドとして提供します。",
    },
    "app/main.py": {
      title: "app/main.py",
      body:
        "アプリケーションのエントリポイントとなるスクリプトの想定です。FastAPI アプリの起動やルーターのマウントなどを担当します。",
    },
    tests: {
      title: "tests/",
      body:
        "単体テストや統合テストを配置するテストコード用フォルダの想定です。pytest などで実行されます。",
    },
    "tests/test_auth.py": {
      title: "tests/test_auth.py",
      body:
        "認証まわりの振る舞いを検証するテストコードの想定です。正常系・異常系のケースをここで確認します。",
    },
  };

  function setActiveNav(viewKey) {
    navItems.forEach((btn) => {
      btn.classList.toggle("nav-item--active", btn.dataset.view === viewKey);
    });
  }

  function setActiveTreeRow(row) {
    treeRows.forEach((r) => r.classList.remove("tree-node__row--active"));
    if (row) {
      row.classList.add("tree-node__row--active");
    }
  }

  function updateSummaryForNode(row) {
    if (!summaryTitleEl || !summaryBodyEl) return;
    if (!row) return;
    const key = row.dataset.nodeKey;
    if (!key) return;

    const summary = nodeSummaries[key];
    if (!summary) return;

    summaryTitleEl.textContent = summary.title;
    summaryBodyEl.textContent = summary.body;
  }

  function setStep(stepNumber) {
    steps.forEach((stepEl) => {
      const value = Number(stepEl.dataset.step);
      stepEl.classList.toggle("step--active", value === stepNumber);
    });
  }

  function switchView(viewKey) {
    views.forEach((viewEl) => {
      const isActive = viewEl.dataset.viewSection === viewKey;
      viewEl.classList.toggle("view--active", isActive);
    });

    const viewDef = viewMap[viewKey];
    if (viewDef && titleEl && subtitleEl) {
      titleEl.textContent = viewDef.title;
      subtitleEl.textContent = viewDef.subtitle;
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const viewKey = item.dataset.view;
      if (!viewKey) return;

      setActiveNav(viewKey);
      switchView(viewKey);
    });
  });

  stepNextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = Number(btn.dataset.nextStep);
      if (!next) return;
      setStep(next);
    });
  });

  if (generateQuizButton) {
    generateQuizButton.addEventListener("click", () => {
      // クイズ生成後はクイズ一覧へ遷移させる
      setActiveNav("quiz-list");
      switchView("quiz-list");
    });
  }

  stepPrevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prev = Number(btn.dataset.prevStep);
      if (!prev) return;
      setStep(prev);
    });
  });

  openQuizListButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveNav("quiz-list");
      switchView("quiz-list");
    });
  });

  openQuizSetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveNav("quiz-list");
      switchView("quiz-set-detail");
    });
  });

  openQuizPlayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveNav("quiz-list");
      switchView("quiz-play");
    });
  });

  backToQuizListButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveNav("quiz-list");
      switchView("quiz-set-detail");
    });
  });

  backToQuizSetListButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveNav("quiz-list");
      switchView("quiz-list");
    });
  });

  quizCounterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".quiz-type-row");
      if (!row) return;
      const valueEl = row.querySelector(".quiz-counter-value");
      if (!valueEl) return;

      const current = Number(valueEl.dataset.count || "0");
      const delta = Number(btn.dataset.delta || "0");
      let next = current + delta;
      if (next < 0) {
        next = 0;
      }

      valueEl.dataset.count = String(next);
      valueEl.textContent = `${next}問`;
    });
  });

  runCodeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!quizOutputEl) return;

      const code = answerTextarea ? answerTextarea.value.trim() : "";
      if (!code) {
        quizOutputEl.textContent =
          ">>> 実行しました\n\n※ コードが空のため、出力はありません。";
      } else {
        quizOutputEl.textContent =
          ">>> 実行しました\n\n（ここに Python 実行結果が表示されます）";
      }
    });
  });

  treeRows.forEach((row) => {
    row.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".tree-node__checkbox")) {
        return;
      }

      setActiveTreeRow(row);
      updateSummaryForNode(row);
    });
  });

  treeFolderRows.forEach((row) => {
    row.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".tree-node__checkbox")) {
        return;
      }

      const node = row.closest(".tree-node--folder");
      if (!node) return;

      const isOpen = node.classList.contains("tree-node--open");

      node.classList.remove("tree-node--open", "tree-node--collapsed");
      const nextIsOpen = !isOpen;
      node.classList.add(nextIsOpen ? "tree-node--open" : "tree-node--collapsed");

      const twist = row.querySelector(".tree-node__twist");
      if (twist) {
        twist.textContent = nextIsOpen ? "▼" : "▶";
      }
    });
  });

  treeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const treeNode = checkbox.closest(".tree-node");
      if (!treeNode) return;

      if (treeNode.classList.contains("tree-node--folder")) {
        const checked = checkbox.checked;
        const descendants = treeNode.querySelectorAll(
          ".tree-node__children .tree-node__checkbox"
        );
        descendants.forEach((childCheckbox) => {
          childCheckbox.checked = checked;
        });
      }
    });
  });

  switchView("project");

  if (appShell && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const isCollapsed = appShell.classList.toggle("app-shell--sidebar-collapsed");

      if (sidebarToggleIcon) {
        sidebarToggleIcon.textContent = isCollapsed
          ? "keyboard_double_arrow_right"
          : "keyboard_double_arrow_left";
      }
    });
  }
});
