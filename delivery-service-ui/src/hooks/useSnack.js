import { useState, useCallback } from 'react';

/**
 * Snackbar / toast notification hook.
 * 
 * Usage:
 *   const { snack, showSuccess, showError, closeSnack } = useSnack();
 *   <Snackbar open={snack.open} ... />
 */
const useSnack = () => {
  const [snack, setSnack] = useState({
    open:     false,
    message:  '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  const showSuccess = useCallback((message) => {
    setSnack({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message) => {
    setSnack({ open: true, message, severity: 'error' });
  }, []);

  const showWarning = useCallback((message) => {
    setSnack({ open: true, message, severity: 'warning' });
  }, []);

  const showInfo = useCallback((message) => {
    setSnack({ open: true, message, severity: 'info' });
  }, []);

  const closeSnack = useCallback(() => {
    setSnack((prev) => ({ ...prev, open: false }));
  }, []);

  return { snack, showSuccess, showError, showWarning, showInfo, closeSnack };
};

export default useSnack;
