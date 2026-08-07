// Application-wide constants

export const APP_NAME = 'KEYSTONE';
export const APP_FULL_NAME = 'KEYSTONE Delivery Service';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// ─── Roles ─────────────────────────────────────────────────────────────────────
export const ROLES = {
  MANAGER:    'MANAGER',
  DISPATCHER: 'DISPATCHER',
  TECHNICIAN: 'TECHNICIAN',
  CUSTOMER:   'CUSTOMER',
};

// ─── Work Order Statuses ───────────────────────────────────────────────────────
export const WORK_ORDER_STATUSES = [
  'NEW', 'ASSIGNED', 'STARTED', 'IN_PROGRESS',
  'RESUMED', 'ON_HOLD', 'COMPLETED', 'CANCELLED',
];

// ─── Priority Levels ───────────────────────────────────────────────────────────
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// ─── Route Paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN:            '/login',
  SIGNUP:           '/signup',
  DASHBOARD:        '/dashboard',
  MY_REQUESTS:      '/my-requests',
  MY_REQUEST_DETAIL:'/my-requests/:id',
  CUSTOMERS:        '/customers',
  CUSTOMER_DETAIL:  '/customers/:id',
  SITES:            '/sites',
  SITE_DETAIL:      '/sites/:id',
  WORK_ORDERS:      '/work-orders',
  WORK_ORDER_DETAIL:'/work-orders/:id',
  ASSIGNMENTS:      '/assignments',
  TRACKING:         '/tracking',
  TECHNICIANS:      '/technicians',
  PARTS:            '/parts',
  TIME_LOGS:        '/time-logs',
  SLA:              '/sla',
  REPORTS:          '/reports',
  NOTIFICATIONS:    '/notifications',
  PROFILE:          '/profile',
};

// ─── Local Storage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'keystone_access_token',
  USER:  'keystone_user',
};

// ─── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50];
