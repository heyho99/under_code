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
  async generateQuiz({ title, description, files }) {
    const userId = getCurrentUserId() ?? 1;

    const body = {
      userId,
      title,
      description,
      files,
    };

    return apiClient.post("/quiz-creation/generate", { body });
  },
};
