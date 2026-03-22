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

export default api;
