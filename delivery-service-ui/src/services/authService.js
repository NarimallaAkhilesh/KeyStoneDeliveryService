import apiClient from '@/api/apiClient';

const AUTH_BASE = '/api/user_auth';

const authService = {
  login: (credentials) =>
    apiClient.post(`${AUTH_BASE}/login`, credentials),

  register: (data) =>
    apiClient.post(`${AUTH_BASE}/register`, data),

  signup: (data) =>
    apiClient.post(`${AUTH_BASE}/signup`, data),

  forgotPassword: (email) =>
    apiClient.post(`${AUTH_BASE}/forgot_password`, { userEmail: email }),

  resetPassword: (data) =>
    apiClient.post(`${AUTH_BASE}/reset_password`, data),

  getUsers: (role) =>
    apiClient.get(`${AUTH_BASE}/users`, { params: role ? { role } : {} }),

  getTechnicians: () =>
    apiClient.get('/api/users', { params: { role: 'TECHNICIAN' } }),
};

export default authService;
