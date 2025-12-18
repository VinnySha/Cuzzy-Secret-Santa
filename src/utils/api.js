const API_BASE = "/api";

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
    return;
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// Auth API
export const login = async (name, secretKey) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, secretKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

export const getUsers = async () => {
  const response = await fetch(`${API_BASE}/auth/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get users");
  }

  return response.json();
};

export const checkUserKey = async (name) => {
  const response = await fetch(
    `${API_BASE}/auth/users/${encodeURIComponent(name)}/check-key`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to check key");
  }

  return response.json();
};

export const verifyUserKey = async (name, secretKey) => {
  const response = await fetch(
    `${API_BASE}/auth/users/${encodeURIComponent(name)}/verify-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secretKey }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify key");
  }

  return response.json();
};

export const setUserKey = async (name, secretKey, currentKey = null) => {
  const body = { secretKey };
  if (currentKey) {
    body.currentKey = currentKey;
  }

  const response = await fetch(
    `${API_BASE}/auth/users/${encodeURIComponent(name)}/set-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to set key");
  }

  return response.json();
};

export const verifyToken = async () => {
  return authFetch("/auth/verify");
};

// Assignment API
export const getMyAssignment = async () => {
  return authFetch("/assignments/my-assignment");
};

export const markAssignmentSeen = async () => {
  return authFetch("/assignments/my-assignment/mark-seen", {
    method: "POST",
  });
};
