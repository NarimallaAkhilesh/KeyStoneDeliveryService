import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

const LoginPage = () => {
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { userEmail: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated()) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    clearError();
    try {
      await login(data);
    } catch {
      // error handled in AuthContext
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1E88E5 100%)',
        p: 2,
      }}
    >
      {/* Background decoration */}
      <Box sx={{
        position: 'fixed', top: -80, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'fixed', bottom: -120, left: -80,
        width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />

      <Card
        elevation={0}
        sx={{
          width: '100%', maxWidth: 420, borderRadius: 4,
          boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1, #1565C0)',
            px: 4, py: 4, textAlign: 'center', color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Box sx={{
              width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocalShippingIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            KEYSTONE
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Delivery Service Management
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, py: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={0.5}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('userEmail', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
              error={!!errors.userEmail}
              helperText={errors.userEmail?.message}
            />

            <TextField
              fullWidth
              label="Password"
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        id="toggle-password-visibility"
                        onClick={togglePasswordVisibility}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" color="action" />
                        ) : (
                          <VisibilityIcon fontSize="small" color="action" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      id="toggle-password-visibility"
                      onClick={togglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" color="action" />
                      ) : (
                        <VisibilityIcon fontSize="small" color="action" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 4, message: 'Minimum 4 characters' },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              id="login-submit-btn"
              disabled={loading}
              sx={{
                py: 1.5, fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg, #1E88E5, #0D47A1)',
                borderRadius: 2,
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Are you a new customer?{' '}
              <Typography
                component={Link}
                to={ROUTES.SIGNUP}
                variant="body2"
                fontWeight={700}
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign Up as Customer
              </Typography>
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            © {new Date().getFullYear()} KEYSTONE Delivery Service. All rights reserved.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
