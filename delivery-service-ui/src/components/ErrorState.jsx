import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Error state display with optional retry callback.
 */
const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: 8,
      color: 'text.secondary',
    }}
  >
    <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
    <Typography variant="body1" color="error" fontWeight={500}>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="primary" size="small" onClick={onRetry} id="retry-btn">
        Retry
      </Button>
    )}
  </Box>
);

export default ErrorState;
