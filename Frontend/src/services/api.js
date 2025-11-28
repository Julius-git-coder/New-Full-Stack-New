// src/services/api.js (Updated with proxy support)
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API calls (protected)
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Get single user
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user with file
  createUser: async (formData) => {
    const response = await api.post("/users", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update user
  updateUser: async (id, formData) => {
    const response = await api.put(`/users/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Note: File download is now handled directly in the component
  // using the proxy URL: /api/users/:id/download
};

// Auth API calls (public)
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  signup: async (formData) => {
    const response = await api.post("/auth/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default api;
