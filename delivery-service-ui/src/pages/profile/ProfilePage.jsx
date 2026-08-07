import {
  Box, Typography, Card, CardContent, Avatar, Divider, Chip, Grid,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '@/context/AuthContext';

const ROLE_COLORS = {
  MANAGER:    { bg: '#E3F2FD', color: '#1565C0' },
  DISPATCHER: { bg: '#E8F5E9', color: '#2E7D32' },
  TECHNICIAN: { bg: '#FFF8E1', color: '#F57F17' },
  CUSTOMER:   { bg: '#FCE4EC', color: '#C62828' },
};

const ROLE_DESCRIPTIONS = {
  MANAGER:    'Full access — Manage all modules, users, reports, and system configuration.',
  DISPATCHER: 'Can manage work orders, customers, sites, and view dashboards.',
  TECHNICIAN: 'Can view assigned work orders, log time, and manage parts usage.',
  CUSTOMER:   'View-only access to own service requests.',
};

const ProfilePage = () => {
  const { user } = useAuth();
  const roleStyle = ROLE_COLORS[user?.role] || { bg: '#F5F5F5', color: '#616161' };

  return (
    <Box className="fade-in" maxWidth={720} mx="auto">
      <Typography variant="h5" fontWeight={800} mb={3}>My Profile</Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid #E0E7EF' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
            px: 4, py: 5, textAlign: 'center', color: '#fff',
          }}
        >
          <Avatar
            sx={{
              width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2rem', fontWeight: 800, mx: 'auto', mb: 2,
              border: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h5" fontWeight={800}>{user?.userName || '—'}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{user?.userEmail}</Typography>
          <Chip
            label={user?.role}
            size="small"
            sx={{
              mt: 1.5, bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 700, fontSize: '0.75rem',
            }}
          />
        </Box>

        <CardContent sx={{ px: 4, py: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Account Information</Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <BadgeIcon color="primary" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Full Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.userName || '—'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <EmailIcon color="primary" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Email Address</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.userEmail || '—'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={700} mb={2}>Role & Permissions</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <SecurityIcon sx={{ color: roleStyle.color, mt: 0.25 }} />
            <Box>
              <Chip
                label={user?.role}
                sx={{ bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 700, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {ROLE_DESCRIPTIONS[user?.role] || 'No description available.'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ bgcolor: '#F0F2F5', borderRadius: 2, p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              🔒 For password changes or account updates, please contact your system administrator.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
