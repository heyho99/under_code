import { apiClient } from "./apiClient.js";

function getCurrentUserId() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem("currentUser");
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (user && typeof user.id === "number") {
        return user.id;
      }
    }
  } catch {
  }
  return null;
}

export const quizCreationApi = {
  async uploadMockSource() {
    const userId = getCurrentUserId() ?? 1;

    const body = {
      userId,
      project_name: "my-react-app",
      files: [
        {
          path: "src/App.js",
          content: "// mock source file content for quiz creation",
        },
        {
          path: "package.json",
          content: '{"name": "my-react-app", "version": "1.0.0"}',
        },
      ],
    };

    return apiClient.post("/quiz-creation/upload", { body });
  },

  async generateQuiz({ sourceId, title, problemCounts, customInstruction, excludePaths }) {
    const userId = getCurrentUserId() ?? 1;

    const body = {
      userId,
      sourceId,
      title,
      problemCounts,
      customInstruction,
      excludePaths,
    };

    return apiClient.post("/quiz-creation/generate", { body });
  },

  async getAnalysis(sourceId) {
    return apiClient.get("/quiz-creation/analysis", {
      params: { sourceId },
    });
  },
};
