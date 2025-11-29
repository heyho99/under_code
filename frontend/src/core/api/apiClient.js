const BASE_URL = (process.env && process.env.NEXT_PUBLIC_API_URL) || "/api/v1";

function buildUrl(path, params) {
  const base = BASE_URL.replace(/\/$/, "");
  const fullPath = `${base}${path}`;

  if (!params || Object.keys(params).length === 0) {
    return fullPath;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  return `${fullPath}?${searchParams.toString()}`;
}

async function request(method, path, options = {}) {
  const { params, body } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = window.localStorage.getItem("authToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore storage errors
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = isJson && data && data.detail
      ? data.detail
      : `API request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get(path, options) {
    return request("GET", path, options);
  },
  post(path, options) {
    return request("POST", path, options);
  },
};
