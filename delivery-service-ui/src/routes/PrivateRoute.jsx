import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { Box, CircularProgress } from '@mui/material';

/**
 * PrivateRoute – guards all authenticated routes.
 * 
 * - If not authenticated → redirect to /login (preserving intended URL)
 * - If allowedRoles provided → check user role, 403 if not allowed
 * - Shows spinner while auth state resolves
 * 
 * Usage:
 *   <PrivateRoute allowedRoles={['MANAGER', 'DISPATCHER']}>
 *     <SomePage />
 *   </PrivateRoute>
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return children;
};

export default PrivateRoute;
