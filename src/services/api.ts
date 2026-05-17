import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30s timeout
});

// Add auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
