import { ProjectView } from "./ProjectView.js";
import { navigate } from "../../router/router.js";

function updateHeader(view) {
  const titleEl = document.querySelector("[data-view-title]");
  const subtitleEl = document.querySelector("[data-view-subtitle]");
  if (titleEl) titleEl.textContent = view.title || "";
  if (subtitleEl) subtitleEl.textContent = view.subtitle || "";
}

function activateSection(sectionKey) {
  const views = document.querySelectorAll(".view");
  views.forEach((el) => {
    const isActive = el.dataset.viewSection === sectionKey;
    el.classList.toggle("view--active", isActive);
  });
}

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

export const ProjectController = {
  mount() {
    const root = ProjectView.getRoot();
    ProjectView.render(root);
    updateHeader(ProjectView);
    activateSection(ProjectView.key);

    if (!root) {
      return;
    }

    const steps = root.querySelectorAll("[data-step]");
    const stepNextButtons = root.querySelectorAll(".js-step-next");
    const stepPrevButtons = root.querySelectorAll(".js-step-prev");
    const openQuizListButtons = root.querySelectorAll(".js-open-quiz-list");
    const treeFolderRows = root.querySelectorAll(".js-tree-folder");
    const treeRows = root.querySelectorAll(".tree-node__row");
    const summaryTitleEl = root.querySelector("[data-summary-title]");
    const summaryBodyEl = root.querySelector("[data-summary-body]");
    const quizCounterButtons = root.querySelectorAll(".quiz-counter-btn");
    const treeCheckboxes = root.querySelectorAll(".tree-node__checkbox");
    const generateQuizButton = root.querySelector(".js-generate-quiz");

    function setStep(stepNumber) {
      steps.forEach((stepEl) => {
        const value = Number(stepEl.dataset.step);
        stepEl.classList.toggle("step--active", value === stepNumber);
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
        navigate("#/quiz-list");
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

    if (generateQuizButton) {
      generateQuizButton.addEventListener("click", () => {
        navigate("#/quiz-list");
      });
    }

    setStep(1);
  },
  unmount() {
    const root = ProjectView.getRoot();
    if (root) root.innerHTML = "";
  },
};
