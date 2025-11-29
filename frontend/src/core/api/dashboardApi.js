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
    const userId = getCurrentUserId() ?? 1;
    return apiClient.get("/dashboard/summary", {
      params: { userId },
    });
  },

  async getCategories() {
    const userId = getCurrentUserId() ?? 1;
    return apiClient.get("/dashboard/categories", {
      params: { userId },
    });
  },

  async getActivities(period = 30) {
    const userId = getCurrentUserId() ?? 1;
    return apiClient.get("/dashboard/activities", {
      params: { userId, period },
    });
  },
};
