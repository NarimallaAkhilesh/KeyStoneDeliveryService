import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import PrivateRoute from './PrivateRoute';
import { ROLES } from '@/utils/constants';

// ─── Lazy-loaded layouts ───────────────────────────────────────────────────────
const SidebarLayout = lazy(() => import('@/layouts/SidebarLayout'));

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage               = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage              = lazy(() => import('@/pages/auth/SignupPage'));
const DashboardPage           = lazy(() => import('@/pages/dashboard/DashboardPage'));
const CustomersPage           = lazy(() => import('@/pages/customers/CustomersPage'));
const SitesPage               = lazy(() => import('@/pages/sites/SitesPage'));
const WorkOrdersPage          = lazy(() => import('@/pages/workorders/WorkOrdersPage'));
const TechnicianAssignmentPage= lazy(() => import('@/pages/assignments/TechnicianAssignmentPage'));
const WorkTrackingPage        = lazy(() => import('@/pages/tracking/WorkTrackingPage'));
const PartsPage               = lazy(() => import('@/pages/parts/PartsPage'));
const TimeLogsPage            = lazy(() => import('@/pages/timelogs/TimeLogsPage'));
const SLAPage                 = lazy(() => import('@/pages/sla/SLAPage'));
const ReportsPage             = lazy(() => import('@/pages/reports/ReportsPage'));
const NotificationsPage       = lazy(() => import('@/pages/notifications/NotificationsPage'));
const ProfilePage             = lazy(() => import('@/pages/profile/ProfilePage'));
const MyRequestsPage          = lazy(() => import('@/pages/customer/MyRequestsPage'));
const MyRequestDetailPage     = lazy(() => import('@/pages/customer/MyRequestDetailPage'));
const UnauthorizedPage        = lazy(() => import('@/pages/UnauthorizedPage'));
const NotFoundPage            = lazy(() => import('@/pages/NotFoundPage'));

// ─── Fullscreen loading spinner ────────────────────────────────────────────────
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F0F2F5' }}>
    <CircularProgress size={52} thickness={4} />
  </Box>
);

// ─── App Router ───────────────────────────────────────────────────────────────
const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public routes */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/signup"       element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected – all authenticated users */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <SidebarLayout />
          </PrivateRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard – all roles */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Profile – all roles */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Customer Portal — My Requests & Detail */}
        <Route path="my-requests" element={
          <PrivateRoute allowedRoles={[ROLES.CUSTOMER]}>
            <MyRequestsPage />
          </PrivateRoute>
        } />
        <Route path="my-requests/:id" element={
          <PrivateRoute allowedRoles={[ROLES.CUSTOMER]}>
            <MyRequestDetailPage />
          </PrivateRoute>
        } />

        {/* Manager + Dispatcher */}
        <Route path="customers" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER]}>
            <CustomersPage />
          </PrivateRoute>
        } />

        <Route path="sites" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER]}>
            <SitesPage />
          </PrivateRoute>
        } />

        {/* Work Orders – Manager, Dispatcher, Technician */}
        <Route path="work-orders" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER, ROLES.TECHNICIAN]}>
            <WorkOrdersPage />
          </PrivateRoute>
        } />

        {/* Technician Assignment – Manager, Dispatcher */}
        <Route path="assignments" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER]}>
            <TechnicianAssignmentPage />
          </PrivateRoute>
        } />

        {/* Work Order Tracking – Manager, Dispatcher, Technician */}
        <Route path="tracking" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER, ROLES.TECHNICIAN]}>
            <WorkTrackingPage />
          </PrivateRoute>
        } />

        {/* Parts & Inventory – Manager, Technician */}
        <Route path="parts" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.TECHNICIAN]}>
            <PartsPage />
          </PrivateRoute>
        } />

        {/* Time Logs – Manager, Technician */}
        <Route path="time-logs" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.TECHNICIAN]}>
            <TimeLogsPage />
          </PrivateRoute>
        } />

        {/* SLA – Manager, Dispatcher */}
        <Route path="sla" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER]}>
            <SLAPage />
          </PrivateRoute>
        } />

        {/* Reports – Manager, Dispatcher */}
        <Route path="reports" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.DISPATCHER]}>
            <ReportsPage />
          </PrivateRoute>
        } />

        {/* Notifications – Manager only */}
        <Route path="notifications" element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
            <NotificationsPage />
          </PrivateRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
