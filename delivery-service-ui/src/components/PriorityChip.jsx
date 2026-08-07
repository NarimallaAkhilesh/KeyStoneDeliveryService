import { Chip } from '@mui/material';
import { getPriorityColor, getPriorityBgColor } from '@/utils/helpers';

/**
 * MUI Chip colored by priority level (LOW / MEDIUM / HIGH / URGENT).
 */
const PriorityChip = ({ priority, size = 'small' }) => (
  <Chip
    label={priority}
    size={size}
    sx={{
      fontWeight: 700,
      borderRadius: 1.5,
      color: getPriorityColor(priority),
      bgcolor: getPriorityBgColor(priority),
      border: `1.5px solid ${getPriorityColor(priority)}30`,
      fontSize: '0.7rem',
      letterSpacing: '0.3px',
    }}
  />
);

export default PriorityChip;
