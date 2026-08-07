import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TablePagination, TextField, InputAdornment,
  Stack, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TimerIcon from '@mui/icons-material/Timer';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import useApi from '@/hooks/useApi';
import inventoryService from '@/services/inventoryService';
import workOrderService from '@/services/workOrderService';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, formatHours } from '@/utils/helpers';

const STATUS_COLORS = { RUNNING: 'success', PAUSED: 'warning', STOPPED: 'default' };

/**
 * TimeLogsPage
 *
 * Strategy:
 * - Managers: load all work orders, then load time logs for the first 20
 *   by workorder (via GET /api/workorders/{id}/timelogs).
 *   We flatten them into a single list.
 * - Technicians: load their work orders via
 *   GET /api/workorders/technician/{technicianId} — but we don't have
 *   the numeric ID stored in AuthContext. We load all WOs and filter
 *   by assignedTechnician email matching the logged-in user's email.
 *
 * Time logs are per-work-order. We show a combined flat view.
 */
const TimeLogsPage = () => {
  const { user, isManager, isDispatcher } = useAuth();

  // Step 1: fetch all work orders (or technician-specific ones)
  const {
    data: workOrders,
    loading: woLoading,
    error: woError,
    execute: loadWOs
  } = useApi(workOrderService.getAll);

  const [timeLogs, setTimeLogs]   = useState([]);
  const [tLoading, setTLoading]   = useState(false);
  const [tError, setTError]       = useState(null);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [rowsPerPage]             = useState(10);

  useEffect(() => { loadWOs(); }, [loadWOs]);

  // Step 2: once WOs loaded, fetch time logs per work order
  useEffect(() => {
    if (!workOrders) return;

    const relevantWOs = isManager || isDispatcher
      ? workOrders
      : workOrders.filter(w =>
          w.assignedTechnician?.userEmail === user?.userEmail
        );

    // Load time logs for up to 30 work orders to avoid too many requests
    const toLoad = relevantWOs.slice(0, 30);
    if (toLoad.length === 0) { setTimeLogs([]); return; }

    setTLoading(true);
    setTError(null);

    Promise.allSettled(
      toLoad.map(wo =>
        inventoryService.getByWorkOrder(wo.id).then(res => {
          const logs = res?.data?.data ?? res?.data ?? [];
          return Array.isArray(logs) ? logs : [];
        }).catch(() => [])
      )
    ).then(results => {
      const allLogs = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);
      setTimeLogs(allLogs);
    }).catch(err => {
      setTError(err?.message || 'Failed to load time logs');
    }).finally(() => {
      setTLoading(false);
    });
  }, [workOrders, isManager, isDispatcher, user?.userEmail]);

  const filtered = timeLogs.filter(t =>
    [t.workOrderNumber, t.workOrder?.workOrderNumber, t.workOrder?.title]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (woLoading || tLoading) return <LoadingSpinner message="Loading time logs..." />;
  if (woError || tError)     return <ErrorState message={woError || tError} onRetry={loadWOs} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Time Logs</Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} time log(s) across work orders
          </Typography>
        </Box>
      </Stack>

      {timeLogs.length === 0 && !tLoading && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No time logs recorded yet. Time tracking starts when a technician begins work on a work order.
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF' }}>
          <TextField
            placeholder="Search by work order..."
            size="small"
            value={search}
            id="timelog-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Work Order</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Total Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <TimerIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>
                        {search ? 'No logs match your search.' : 'No time logs yet.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((t, idx) => (
                <TableRow key={t.id || idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {t.workOrder?.workOrderNumber || t.workOrderNumber || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.workOrder?.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {t.technician?.userName || t.user?.userName || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDateTime(t.startTime)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {t.endTime ? formatDateTime(t.endTime) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {formatHours((t.totalMinutes || 0) / 60)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status || 'STOPPED'}
                      size="small"
                      color={STATUS_COLORS[t.status] || 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {t.notes || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPageOptions={[10]}
        />
      </Paper>
    </Box>
  );
};

export default TimeLogsPage;
