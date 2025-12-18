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

export const quizPlayApi = {
  async getProblemDetail(problemId) {
    return apiClient.get(`/problems/${problemId}`);
  },

  async executeCode({ problemId, language, code, testcaseIndex }) {
    return apiClient.post("/runner/execute", {
      body: {
        problemId,
        language,
        code,
        testcaseIndex,
      },
    });
  },

  async submit({ problemId, language, code }) {
    return apiClient.post("/submissions", {
      body: {
        problemId,
        language,
        code,
      },
    });
  },
};
