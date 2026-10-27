import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notes_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if not already on auth page
      if (localStorage.getItem('notes_auth_token')) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('notes_auth_token');
        localStorage.removeItem('notes_user_data');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
