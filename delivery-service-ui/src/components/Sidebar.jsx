import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Avatar, Tooltip, IconButton,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, ROLES } from '@/utils/constants';

// MUI Icons
import DashboardIcon        from '@mui/icons-material/Dashboard';
import PeopleIcon           from '@mui/icons-material/People';
import LocationOnIcon       from '@mui/icons-material/LocationOn';
import AssignmentIcon       from '@mui/icons-material/Assignment';
import EngineeringIcon      from '@mui/icons-material/Engineering';
import TrackChangesIcon     from '@mui/icons-material/TrackChanges';
import BuildIcon            from '@mui/icons-material/Build';
import TimerIcon            from '@mui/icons-material/Timer';
import VerifiedIcon         from '@mui/icons-material/Verified';
import AssessmentIcon       from '@mui/icons-material/Assessment';
import NotificationsIcon    from '@mui/icons-material/Notifications';
import LogoutIcon           from '@mui/icons-material/Logout';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: ROUTES.DASHBOARD,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.TECHNICIAN, ROLES.CUSTOMER],
  },
  {
    label: 'My Requests',
    icon: <AssignmentIcon />,
    path: ROUTES.MY_REQUESTS,
    roles: [ROLES.CUSTOMER],
  },
  {
    label: 'Customers',
    icon: <PeopleIcon />,
    path: ROUTES.CUSTOMERS,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER],
  },
  {
    label: 'Sites',
    icon: <LocationOnIcon />,
    path: ROUTES.SITES,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER],
  },
  {
    label: 'Work Orders',
    icon: <AssignmentIcon />,
    path: ROUTES.WORK_ORDERS,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.TECHNICIAN],
  },
  {
    label: 'Tech Assignments',
    icon: <EngineeringIcon />,
    path: ROUTES.ASSIGNMENTS,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER],
  },
  {
    label: 'WO Tracking',
    icon: <TrackChangesIcon />,
    path: ROUTES.TRACKING,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.TECHNICIAN],
  },
  {
    label: 'Parts & Inventory',
    icon: <BuildIcon />,
    path: ROUTES.PARTS,
    roles: [ROLES.MANAGER, ROLES.TECHNICIAN],
  },
  {
    label: 'Time Logs',
    icon: <TimerIcon />,
    path: ROUTES.TIME_LOGS,
    roles: [ROLES.MANAGER, ROLES.TECHNICIAN],
  },
  {
    label: 'SLA Tracking',
    icon: <VerifiedIcon />,
    path: ROUTES.SLA,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER],
  },
  {
    label: 'Reports',
    icon: <AssessmentIcon />,
    path: ROUTES.REPORTS,
    roles: [ROLES.MANAGER, ROLES.DISPATCHER],
  },
  {
    label: 'Notifications',
    icon: <NotificationsIcon />,
    path: ROUTES.NOTIFICATIONS,
    roles: [ROLES.MANAGER],
  },
];

const Sidebar = ({ open, collapsed, width, isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#0D47A1',
        color: '#fff',
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed ? 1.5 : 2.5,
          py: 2.5,
          minHeight: 64,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <LocalShippingIcon sx={{ fontSize: 30, color: '#82B1FF', flexShrink: 0 }} />
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1, color: '#fff' }}>
              KEYSTONE
            </Typography>
            <Typography variant="caption" sx={{ color: '#90CAF9', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              Delivery Service
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, py: 1.5, px: collapsed ? 0.5 : 1 }}>
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: collapsed ? 1.25 : 1.75,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: 44,
                    bgcolor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? '#fff' : '#90CAF9',
                      minWidth: collapsed ? 'unset' : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? '#fff' : '#B3D4FF',
                      }}
                    />
                  )}
                  {active && !collapsed && (
                    <Box
                      sx={{
                        width: 4, height: 20, bgcolor: '#82B1FF',
                        borderRadius: 2, ml: 'auto',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* User profile + Logout */}
      <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#1E88E5', fontSize: '0.875rem', fontWeight: 700 }}>
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }} noWrap>
                {user?.userName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#90CAF9', fontSize: '0.7rem' }} noWrap>
                {user?.role}
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip title="Logout" placement="right">
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 2, py: 0.75,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#FF8A80',
              '&:hover': { bgcolor: 'rgba(255,100,100,0.15)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 'unset' : 36 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: 260, border: 'none' } }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        '& .MuiDrawer-paper': {
          width,
          border: 'none',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
