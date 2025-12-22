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
    // ignore parse/storage errors
  }
  return null;
}

export const dashboardApi = {
  async getSummary() {
    return apiClient.get("/dashboard/summary");
  },

  async getCategories() {
    return apiClient.get("/dashboard/categories");
  },

  async getActivities(period = 30) {
    return apiClient.get("/dashboard/activities", {
      params: { period },
    });
  },

  async getLanguages() {
    return apiClient.get("/dashboard/languages");
  },
};
