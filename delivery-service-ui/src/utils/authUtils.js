// ─── JWT Token Utilities ──────────────────────────────────────────────────────

const TOKEN_KEY = 'keystone_access_token';
const USER_KEY  = 'keystone_user';

export const tokenUtils = {
  /** Store JWT token in localStorage */
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /** Get JWT token from localStorage */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Remove JWT token from localStorage */
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /** Check if a token exists */
  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /** Decode JWT payload (without verification — server validates) */
  decodeToken: (token) => {
    try {
      const base64Payload = token.split('.')[1];
      const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },

  /** Check if the stored token is expired */
  isTokenExpired: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return true;
    try {
      const payload = tokenUtils.decodeToken(token);
      if (!payload || !payload.exp) return true;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },
};

// ─── User Utilities ────────────────────────────────────────────────────────────

export const userUtils = {
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  /** Get the current user's role */
  getRole: () => {
    const user = userUtils.getUser();
    return user?.role || null;
  },

  /** Check if the current user has a specific role */
  hasRole: (role) => {
    return userUtils.getRole() === role;
  },

  /** Check if the user is a Manager */
  isManager: () => userUtils.hasRole('MANAGER'),

  /** Check if the user is a Dispatcher */
  isDispatcher: () => userUtils.hasRole('DISPATCHER'),

  /** Check if the user is a Technician */
  isTechnician: () => userUtils.hasRole('TECHNICIAN'),

  /** Check if the user is a Customer */
  isCustomer: () => userUtils.hasRole('CUSTOMER'),
};

// ─── Clear all auth data ───────────────────────────────────────────────────────

export const clearAuthData = () => {
  tokenUtils.removeToken();
  userUtils.removeUser();
};
