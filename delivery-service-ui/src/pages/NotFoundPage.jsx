import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 3, bgcolor: '#F0F2F5',
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: '#B0BEC5' }} />
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#1a1a2e' }}>404</Typography>
      <Typography variant="h6" color="text.secondary">Page not found</Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')} id="go-home-btn">
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
