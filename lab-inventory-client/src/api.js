import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

const API = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json'
  },
});

// Attach admin JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Admin Endpoints ────────────────────────────────────────────────
export const adminLogin = (username, password) =>
  API.post('/admin/login', { username, password });

export const getAuditLogs = () =>
  API.get('/admin/audit-logs');

// ─── Material Endpoints ─────────────────────────────────────────────
export const getMaterials = (search = '') =>
  API.get('/material', { params: search ? { search } : {} });

export const createMaterial = (data) =>
  API.post('/material', data);

export const updateMaterial = (id, data) =>
  API.put(`/material/${id}`, data);

export const deleteMaterial = (id) =>
  API.delete(`/material/${id}`);

// ─── User Endpoints ─────────────────────────────────────────────────
export const userLogin = (name) =>
  API.post('/user/login', { name });

export const userSearch = (logId, keyword) =>
  API.post('/user/search', { logId, keyword });

export const userLogout = (logId) =>
  API.post('/user/logout', { logId });

export default API;
