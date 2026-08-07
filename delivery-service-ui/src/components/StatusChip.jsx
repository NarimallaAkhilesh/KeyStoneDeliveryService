import { Chip } from '@mui/material';
import { getStatusColor, titleCase } from '@/utils/helpers';

/**
 * MUI Chip that auto-colors based on work order status string.
 */
const StatusChip = ({ status, size = 'small' }) => (
  <Chip
    label={titleCase(status)}
    size={size}
    color={getStatusColor(status)}
    sx={{ fontWeight: 600, borderRadius: 1.5 }}
  />
);

export default StatusChip;
