import { Card, CardContent, Box, Typography } from '@mui/material';

/**
 * Stat card for dashboard KPI display.
 * 
 * Props:
 *  - title:   string
 *  - value:   string | number
 *  - icon:    ReactNode (MUI icon)
 *  - color:   hex color string
 *  - subtitle: optional string
 */
const StatCard = ({ title, value, icon, color = '#1565C0', subtitle }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '1px solid #E0E7EF',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
      },
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mt: 0.5, lineHeight: 1 }}>
            {value ?? '—'}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}18`,
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
