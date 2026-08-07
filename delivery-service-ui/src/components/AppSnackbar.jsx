import { Snackbar, Alert } from '@mui/material';

/**
 * Global Snackbar notification component.
 * 
 * Usage:
 *   const { snack, showSuccess, closeSnack } = useSnack();
 *   <AppSnackbar snack={snack} onClose={closeSnack} />
 */
const AppSnackbar = ({ snack, onClose }) => (
  <Snackbar
    open={snack.open}
    autoHideDuration={4000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <Alert
      onClose={onClose}
      severity={snack.severity}
      variant="filled"
      sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
    >
      {snack.message}
    </Alert>
  </Snackbar>
);

export default AppSnackbar;
