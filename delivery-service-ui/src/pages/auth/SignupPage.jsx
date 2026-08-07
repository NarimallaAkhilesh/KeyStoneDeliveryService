import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Divider,
  Grid, LinearProgress, Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { ROUTES } from '@/utils/constants';

const SignupPage = () => {
  const { loginWithToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      gstNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password', '');

  useEffect(() => {
    if (isAuthenticated()) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, navigate]);

  // Password strength calculation
  const getPasswordCriteria = (pass) => ({
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    digit: /\d/.test(pass),
    special: /[@$!%*?&]/.test(pass),
  });

  const criteria = getPasswordCriteria(watchPassword);
  const score = Object.values(criteria).filter(Boolean).length;
  const strengthPercent = (score / 5) * 100;

  const getStrengthColor = () => {
    if (score <= 2) return '#F44336';
    if (score <= 4) return '#FF9800';
    return '#4CAF50';
  };

  const getStrengthLabel = () => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    setSubmitting(true);

    const payload = {
      customerName: data.customerName,
      companyName: data.companyName || null,
      email: data.email,
      phone: data.phone,
      alternatePhone: data.alternatePhone || null,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode || null,
      gstNumber: data.gstNumber || null,
      password: data.password,
    };

    try {
      const response = await authService.signup(payload);
      const { token, userName, userEmail, role } = response.data;
      loginWithToken(token, { userName, userEmail, role });
      navigate(ROUTES.MY_REQUESTS, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.data || 'Signup failed. Please try again.';
      if (typeof msg === 'object') {
        setSubmitError(Object.values(msg).join(' | '));
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1E88E5 100%)',
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%', maxWidth: 840, borderRadius: 4,
          boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1, #1565C0)',
            px: 4, py: 3, textAlign: 'center', color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box sx={{
              width: 54, height: 54, bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocalShippingIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            KEYSTONE CUSTOMER SIGNUP
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Create your account to start managing delivery service requests
          </Typography>
        </Box>

        <CardContent sx={{ px: { xs: 3, sm: 5 }, py: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {/* Account Information Header */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Contact & Organization Information
                </Typography>
                <Divider sx={{ mt: 0.5, mb: 1.5 }} />
              </Grid>

              {/* Customer Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer / Contact Name *"
                  id="signup-customerName"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('customerName', { required: 'Customer name is required' })}
                  error={!!errors.customerName}
                  helperText={errors.customerName?.message}
                />
              </Grid>

              {/* Company Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  id="signup-companyName"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('companyName')}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  id="signup-email"
                  type="email"
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
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number (10 Digits) *"
                  id="signup-phone"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Must be exactly 10 digits' },
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>

              {/* Address Header */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Address Details
                </Typography>
                <Divider sx={{ mt: 0.5, mb: 1.5 }} />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address *"
                  id="signup-address"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('address', { required: 'Address is required' })}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City *"
                  id="signup-city"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationCityIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCityIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('city', { required: 'City is required' })}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State *"
                  id="signup-state"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('state', { required: 'State is required' })}
                  error={!!errors.state}
                  helperText={errors.state?.message}
                />
              </Grid>

              {/* Pincode */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Pincode / Postal Code"
                  id="signup-pincode"
                  {...register('pincode')}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country *"
                  id="signup-country"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PublicIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('country', { required: 'Country is required' })}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                />
              </Grid>

              {/* GST Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Number (Optional)"
                  id="signup-gstNumber"
                  {...register('gstNumber')}
                />
              </Grid>

              {/* Security & Password Header */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Account Security
                </Typography>
                <Divider sx={{ mt: 0.5, mb: 1.5 }} />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password *"
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
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
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Include upper, lower, number, special char',
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password *"
                  id="signup-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === watchPassword || 'Passwords do not match',
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>

              {/* Password Strength Meter */}
              {watchPassword && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700}>
                        Password Strength:
                      </Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: getStrengthColor() }}>
                        {getStrengthLabel()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={strengthPercent}
                      sx={{
                        height: 6, borderRadius: 3, mb: 1.5,
                        bgcolor: '#E0E0E0',
                        '& .MuiLinearProgress-bar': { bgcolor: getStrengthColor() }
                      }}
                    />
                    <Grid container spacing={1}>
                      {[
                        { key: 'length', label: 'At least 8 characters' },
                        { key: 'upper', label: '1 Uppercase letter (A-Z)' },
                        { key: 'lower', label: '1 Lowercase letter (a-z)' },
                        { key: 'digit', label: '1 Number (0-9)' },
                        { key: 'special', label: '1 Special character (@$!%*?&)' },
                      ].map((item) => (
                        <Grid item xs={12} sm={6} key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {criteria[item.key] ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16, color: '#B0BEC5' }} />
                          )}
                          <Typography variant="caption" color={criteria[item.key] ? 'text.primary' : 'text.secondary'}>
                            {item.label}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  id="signup-submit-btn"
                  disabled={submitting}
                  sx={{
                    py: 1.6, fontWeight: 700, fontSize: '1rem',
                    background: 'linear-gradient(135deg, #1E88E5, #0D47A1)',
                    borderRadius: 2,
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Customer Account'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                component={Link}
                to={ROUTES.LOGIN}
                variant="body2"
                fontWeight={700}
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;
