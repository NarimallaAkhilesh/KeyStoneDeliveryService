import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import { tokenUtils, userUtils, clearAuthData } from '@/utils/authUtils';
import { ROUTES } from '@/utils/constants';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize state from localStorage (for page refresh persistence)
  const [user, setUser]         = useState(() => userUtils.getUser());
  const [token, setToken]       = useState(() => tokenUtils.getToken());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const data = response.data?.data || response.data;

      // Store token
      const jwtToken = data.token || data.accessToken;
      tokenUtils.setToken(jwtToken);
      setToken(jwtToken);

      // Build user object from response
      const userData = {
        userName:  data.userName  || data.username,
        userEmail: data.userEmail || data.email,
        role:      data.role,
      };
      userUtils.setUser(userData);
      setUser(userData);

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setToken(null);
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate]);

  // ─── Check if authenticated ────────────────────────────────────────────────
  const isAuthenticated = useCallback(() => {
    return !!token && !tokenUtils.isTokenExpired();
  }, [token]);

  // ─── Role checks ───────────────────────────────────────────────────────────
  const isManager    = user?.role === 'MANAGER';
  const isDispatcher = user?.role === 'DISPATCHER';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isCustomer   = user?.role === 'CUSTOMER';

  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasAnyRole = useCallback((roles) => roles.includes(user?.role), [user]);

  // ─── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isManager,
    isDispatcher,
    isTechnician,
    isCustomer,
    hasRole,
    hasAnyRole,
    clearError,
  }), [
    user, token, loading, error,
    login, logout, isAuthenticated,
    isManager, isDispatcher, isTechnician, isCustomer,
    hasRole, hasAnyRole, clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
