import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 2,
        background: 'linear-gradient(135deg, #F0F2F5, #E3F2FD)',
      }}
    >
      <Box sx={{
        width: 80, height: 80, borderRadius: 3, bgcolor: '#FFEBEE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LockIcon sx={{ fontSize: 44, color: '#C62828' }} />
      </Box>
      <Typography variant="h3" fontWeight={800} color="#1a1a2e">403</Typography>
      <Typography variant="h6" color="text.secondary">Access Denied</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
        You do not have permission to view this page. Please contact your administrator.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')} id="go-dashboard-btn">
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
