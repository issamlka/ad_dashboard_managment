import axios from "axios";

const API_URL = "http://localhost:5168/api";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor — add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear and redirect to login
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth services
export const authService = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"), // ← add this
};

// Users services
export const usersService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post("/users", user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
};

// AD services
export const adService = {
  getAll: () => api.get("/ad/users"),
  getUser: (username) => api.get(`/ad/users/${username}`),
  createUser: (data) => api.post("/ad/users", data),
  disableUser: (username) => api.put(`/ad/users/${username}/disable`),
  enableUser: (username) => api.put(`/ad/users/${username}/enable`), // ← add
};

// Config service
export const configService = {
  getConfig: () => api.get("/config"),
};

export const permissionsService = {
  getMy: () => api.get("/permissions/my"),
  getByUserId: (userId) => api.get(`/permissions/user/${userId}`),
  update: (userId, permissions) =>
    api.put(`/permissions/user/${userId}`, permissions),
};

export const auditLogService = {
  getAll: (params) => api.get("/auditlogs", { params }),
  getStats: () => api.get("/auditlogs/stats"), // ← add this
  getRecentAdUsers: () => api.get("/auditlogs/recent-ad-users"), // ← add
};

export const adStructureService = {
  // Groups
  getGroups: () => api.get("/adstructure/groups"),
  getGroupMembers: (groupName) =>
    api.get(`/adstructure/groups/${groupName}/members`),
  createGroup: (data) => api.post("/adstructure/groups", data),
  addUserToGroup: (groupName, username) =>
    api.post(`/adstructure/groups/${groupName}/members/${username}`),
  removeUserFromGroup: (groupName, username) =>
    api.delete(`/adstructure/groups/${groupName}/members/${username}`),

  // OUs
  getOUs: () => api.get("/adstructure/ous"),
  createOU: (data) => api.post("/adstructure/ous", data),
  getUsersInOU: (ouDN) => api.get(`/adstructure/ous/${ouDN}/users`),
};

export default api;
