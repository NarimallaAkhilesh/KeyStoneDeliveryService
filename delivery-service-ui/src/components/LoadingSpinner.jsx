import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Centered loading spinner with optional message.
 */
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: 8,
    }}
  >
    <CircularProgress size={44} thickness={4} />
    <Typography variant="body2" color="text.secondary" fontWeight={500}>
      {message}
    </Typography>
  </Box>
);

export default LoadingSpinner;
