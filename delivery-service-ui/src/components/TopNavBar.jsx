import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar,
  Chip, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon       from '@mui/icons-material/Menu';
import MenuOpenIcon   from '@mui/icons-material/MenuOpen';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Map route paths to page titles
const PAGE_TITLES = {
  '/dashboard':      'Dashboard',
  '/customers':      'Customer Management',
  '/sites':          'Site Management',
  '/work-orders':    'Work Orders',
  '/assignments':    'Technician Assignments',
  '/tracking':       'Work Order Tracking',
  '/parts':          'Parts & Inventory',
  '/time-logs':      'Time Logs',
  '/sla':            'SLA Tracking',
  '/reports':        'Reports & Analytics',
  '/notifications':  'Notifications',
  '/profile':        'My Profile',
};

const ROLE_COLORS = {
  MANAGER:    { bg: '#E3F2FD', color: '#1565C0' },
  DISPATCHER: { bg: '#E8F5E9', color: '#2E7D32' },
  TECHNICIAN: { bg: '#FFF8E1', color: '#F57F17' },
  CUSTOMER:   { bg: '#FCE4EC', color: '#C62828' },
};

const TopNavBar = ({ onMenuClick, sidebarCollapsed }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));

  const pathname = '/' + location.pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[pathname] || 'KEYSTONE';

  const roleStyle = ROLE_COLORS[user?.role] || { bg: '#F5F5F5', color: '#616161' };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        color: 'text.primary',
        borderBottom: '1px solid #E0E7EF',
        zIndex: (t) => t.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 64 }}>
        {/* Hamburger / Collapse toggle */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ color: '#546E7A', '&:hover': { bgcolor: '#EEF2FF' } }}
          aria-label="toggle sidebar"
          id="sidebar-toggle-btn"
        >
          {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        {/* Page Title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          {pageTitle}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Notification Bell */}
        <Tooltip title="Notifications">
          <IconButton
            id="notification-btn"
            onClick={() => navigate('/notifications')}
            sx={{ color: '#546E7A', '&:hover': { bgcolor: '#EEF2FF' } }}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
        </Tooltip>

        {/* Role Chip */}
        {!isMobile && (
          <Chip
            label={user?.role}
            size="small"
            sx={{
              bgcolor: roleStyle.bg,
              color:   roleStyle.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              letterSpacing: '0.3px',
            }}
          />
        )}

        {/* Avatar */}
        <Tooltip title={user?.userName || 'Profile'}>
          <Avatar
            id="user-avatar"
            onClick={() => navigate('/profile')}
            sx={{
              width: 36, height: 36,
              bgcolor: '#1565C0',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 },
            }}
          >
            {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
