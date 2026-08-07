import axios from 'axios';
import { tokenUtils, clearAuthData } from '@/utils/authUtils';

// ─── Create Axios Instance ─────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Automatically attach Bearer token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Handle 401 Unauthorized globally → clear auth data → redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired or invalid
      clearAuthData();
      // Use window.location to avoid circular imports with router
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      console.warn('[API] 403 Forbidden – insufficient permissions');
    }

    if (status >= 500) {
      console.error('[API] Server error:', error?.response?.data?.message || 'Internal Server Error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
