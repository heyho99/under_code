import { apiClient } from "./apiClient.js";

export const authApi = {
  async login({ email, password }) {
    return apiClient.post("/auth/login", {
      body: { email, password },
    });
  },

  async signup({ username, email, password }) {
    return apiClient.post("/auth/signup", {
      body: { username, email, password },
    });
  },
};
