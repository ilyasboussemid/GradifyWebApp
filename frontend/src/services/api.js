import axios from 'axios';

/**
 * Instance Axios configurée pour le gateway API.
 * En dev, Vite proxy /api → gateway (localhost:8080).
 * En prod, nginx fait le même proxy.
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : ajoute le JWT si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gradify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : gère les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gradify_user');
      localStorage.removeItem('gradify_token');
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
