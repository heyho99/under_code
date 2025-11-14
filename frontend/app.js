document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");
  const titleEl = document.querySelector("[data-view-title]");
  const subtitleEl = document.querySelector("[data-view-subtitle]");
  const appShell = document.querySelector(".app-shell");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
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
  const quizTypePills = document.querySelectorAll(".pill[data-quiz-type]");

  const viewCopy = {
    project: {
      title: "クイズを作成する",
      subtitle:
        "プロジェクトの読み込みからクイズ生成、一覧からの挑戦までを一画面で行います。",
    },
    "quiz-list": {
      title: "クイズに挑戦する",
      subtitle:
        "作成済みのクイズセットから選択し、ブラウザ上のPython実行環境で試せる想定の画面です。",
    },
    "quiz-set-detail": {
      title: "クイズセット内のクイズを選ぶ",
      subtitle:
        "選択したクイズセットに含まれるクイズの一覧から、挑戦したい問題を選択します。",
    },
    "quiz-play": {
      title: "クイズを解く",
      subtitle:
        "選択したクイズの詳細と回答エリアを表示し、Python実行環境で試すことを想定した画面です。",
    },
  };

  const nodeSummaries = {
    app: {
      title: "app/ フォルダ",
      body:
        "アプリケーション本体のコードが入るルートフォルダの想定です。ルーティングやサービス層などの中心的な構造が配置されます。",
    },
    "app/api": {
      title: "app/api/ フォルダ",
      body:
        "エンドポイント定義を置くAPIレイヤの想定です。FastAPI の router やエンドポイントごとのハンドラがまとまります。",
    },
    "app/services": {
      title: "app/services/ フォルダ",
      body:
        "ユースケースやドメインロジックを実装するサービス層の想定です。ビジネスルールをここに集約し、API層から呼び出します。",
    },
    "app/main.py": {
      title: "app/main.py ファイル",
      body:
        "アプリケーションのエントリポイントとなるスクリプトの想定です。FastAPI アプリの起動やルーターのマウントなどを担当します。",
    },
    tests: {
      title: "tests/ フォルダ",
      body:
        "単体テストや統合テストを配置するテストコード用フォルダの想定です。pytest などで実行されます。",
    },
    "tests/test_auth.py": {
      title: "tests/test_auth.py ファイル",
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
    views.forEach((view) => {
      const isActive = view.dataset.viewSection === viewKey;
      view.classList.toggle("view--active", isActive);
    });

    const copy = viewCopy[viewKey];
    if (copy && titleEl && subtitleEl) {
      titleEl.textContent = copy.title;
      subtitleEl.textContent = copy.subtitle;
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

  quizTypePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const group = pill.closest(".pill-group");
      if (!group) return;
      const siblings = group.querySelectorAll(".pill[data-quiz-type]");
      siblings.forEach((p) => p.classList.remove("pill--active"));
      pill.classList.add("pill--active");
    });
  });

  treeRows.forEach((row) => {
    row.addEventListener("click", () => {
      setActiveTreeRow(row);
      updateSummaryForNode(row);
    });
  });

  treeFolderRows.forEach((row) => {
    row.addEventListener("click", () => {
      const node = row.closest(".tree-node--folder");
      if (!node) return;

      const isCollapsed = node.classList.contains("tree-node--collapsed");
      node.classList.toggle("tree-node--collapsed", !isCollapsed);
      node.classList.toggle("tree-node--open", isCollapsed);
    });
  });

  switchView("project");

  if (appShell && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      appShell.classList.toggle("app-shell--sidebar-collapsed");
    });
  }
});
