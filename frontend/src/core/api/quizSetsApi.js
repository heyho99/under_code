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

export const quizSetsApi = {
  async getQuizSets() {
    return apiClient.get("/quiz-sets");
  },

  async getQuizSetDetail(quizSetId) {
    return apiClient.get(`/quiz-sets/${quizSetId}`);
  },
};
