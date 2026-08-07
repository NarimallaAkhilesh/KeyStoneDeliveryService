import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TablePagination, TextField, InputAdornment,
  Stack, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import slaService from '@/services/slaService';
import { formatDateTime } from '@/utils/helpers';

const NotificationsPage = () => {
  const { snack, showSuccess, showError, closeSnack } = useSnack();
  const { data: emailLogs, loading, error, execute: loadLogs } = useApi(slaService.getEmailLogs);

  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(0);
  const [rowsPerPage]       = useState(10);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const filtered = (emailLogs || []).filter(log =>
    [log.recipientEmail, log.subject]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <LoadingSpinner message="Loading notification logs..." />;
  if (error)   return <ErrorState message={error} onRetry={loadLogs} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} email notification log(s)
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} id="refresh-notifications-btn" onClick={loadLogs}>
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF' }}>
          <TextField placeholder="Search notifications..." size="small" value={search} id="notification-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ width: { xs: '100%', sm: 320 } }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <NotificationsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>{search ? 'No notifications match your search.' : 'No email notifications logged yet.'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((log, idx) => (
                <TableRow key={log.id || idx} hover>
                  <TableCell><Typography variant="caption" color="text.secondary">{log.id}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{log.recipientEmail}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 320 }} noWrap>
                      {log.subject || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.sentStatus ? 'Sent' : 'Failed'} size="small"
                      color={log.sentStatus ? 'success' : 'error'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell><Typography variant="caption">{formatDateTime(log.sentAt)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
      </Paper>

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default NotificationsPage;
