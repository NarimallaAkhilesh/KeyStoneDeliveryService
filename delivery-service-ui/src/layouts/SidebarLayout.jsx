import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';

const SIDEBAR_WIDTH   = 260;
const COLLAPSED_WIDTH = 72;

/**
 * SidebarLayout – the main application shell.
 * 
 * ┌──────────┬────────────────────────────────────┐
 * │ Sidebar  │  TopNavBar                         │
 * │          ├────────────────────────────────────┤
 * │          │  <Outlet /> (page content)          │
 * └──────────┴────────────────────────────────────┘
 */
const SidebarLayout = () => {
  const theme = useTheme();
  const isMobile    = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen]         = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#F0F2F5' }}>
      {/* Sidebar */}
      <Sidebar
        open={isMobile ? open : true}
        collapsed={!isMobile && collapsed}
        width={sidebarWidth}
        isMobile={isMobile}
        onClose={() => setOpen(false)}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'hidden',
        }}
      >
        {/* Top Navigation Bar */}
        <TopNavBar onMenuClick={handleDrawerToggle} sidebarCollapsed={collapsed} />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout;
