import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, TablePagination, Stack, MenuItem,
  Select, FormControl, InputLabel, Chip, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import StatusChip from '@/components/StatusChip';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import trackingService from '@/services/trackingService';
import workOrderService from '@/services/workOrderService';
import { formatDateTime } from '@/utils/helpers';

const STATUS_OPTIONS = ['NEW', 'ASSIGNED', 'STARTED', 'IN_PROGRESS', 'RESUMED', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

const UpdateStatusDialog = ({ open, onClose, onSave, workOrder, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { newStatus: '', remarks: '' }
  });
  useEffect(() => { if (open) reset({ newStatus: '', remarks: '' }); }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700}>Update Work Order Status</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb= {2}>
            Work Order: <strong>{workOrder?.workOrderNumber}</strong> — Current Status: <StatusChip status={workOrder?.status} />
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="New Status *"
                defaultValue=""
                helperText={errors.newStatus?.message || "Select target status transition"}
                {...register('newStatus', { required: 'Status transition is required' })}
                error={!!errors.newStatus}
                id="update-status-select"
              >
                {STATUS_OPTIONS.filter(s => s !== workOrder?.status).map(s =>
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                placeholder="Enter status update notes or reason..."
                helperText="Optional notes explaining status change"
                multiline
                rows={2}
                {...register('remarks')}
                id="update-status-remarks"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="status-cancel">Cancel</Button>
          <Button type="submit" variant="contained" id="status-update" disabled={loading}>
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const HistoryDialog = ({ open, onClose, history, workOrder }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle fontWeight={700}>
      Status History — {workOrder?.workOrderNumber}
    </DialogTitle>
    <DialogContent dividers>
      {(history || []).length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>No history available.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Previous Status</TableCell>
              <TableCell>New Status</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(history || []).map((h, i) => (
              <TableRow key={h.id || i}>
                <TableCell>{h.previousStatus ? <StatusChip status={h.previousStatus} /> : '—'}</TableCell>
                <TableCell><StatusChip status={h.newStatus} /></TableCell>
                <TableCell><Typography variant="body2">{h.updatedBy}</Typography></TableCell>
                <TableCell><Typography variant="caption">{h.remarks || '—'}</Typography></TableCell>
                <TableCell><Typography variant="caption">{formatDateTime(h.timestamp)}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} id="history-close">Close</Button>
    </DialogActions>
  </Dialog>
);

const WorkTrackingPage = () => {
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: workOrders, loading, error, execute: loadWOs } = useApi(workOrderService.getAll);
  const { execute: updateStatus, loading: updating } = useApi(trackingService.updateStatus);

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(0);
  const [rowsPerPage]               = useState(10);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => { loadWOs(); }, [loadWOs]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(0);
  };

  const filtered = (workOrders || []).filter(w => {
    const matchSearch = [w.workOrderNumber, w.title, w.assignedTechnicianName]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || w.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleUpdateStatus = useCallback(async (data) => {
    try {
      await updateStatus(updateTarget.id, { newStatus: data.newStatus, remarks: data.remarks });
      showSuccess('Status updated successfully');
      setUpdateTarget(null);
      loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to update status'); }
  }, [updateStatus, updateTarget, loadWOs, showSuccess, showError]);

  const handleViewHistory = useCallback(async (wo) => {
    setHistoryTarget(wo);
    setHistLoading(true);
    try {
      const res = await trackingService.getStatusHistory(wo.id);
      const data = res?.data?.data ?? res?.data ?? res;
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, []);

  if (loading) return <LoadingSpinner message="Loading work order tracking..." />;
  if (error)   return <ErrorState message={error} onRetry={loadWOs} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Work Order Tracking</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} work order(s) found</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadWOs} id="tracking-refresh-btn">
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField placeholder="Search by WO number, title, technician..." size="small" value={search} id="tracking-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" id="tracking-status-filter"
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">All Statuses</MenuItem>
              {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || statusFilter) && (
            <Button variant="text" color="secondary" startIcon={<FilterAltOffIcon />} onClick={handleResetFilters} id="tracking-reset-filters">
              Reset Filters
            </Button>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>WO Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Completed At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <TrackChangesIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>No work orders match filter criteria.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell><Chip label={w.workOrderNumber} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }} /></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{w.title}</Typography></TableCell>
                  <TableCell><StatusChip status={w.status} /></TableCell>
                  <TableCell><Typography variant="body2">{w.assignedTechnicianName || '—'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{w.scheduledDate ? formatDateTime(w.scheduledDate) : '—'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{w.completedAt ? formatDateTime(w.completedAt) : '—'}</Typography></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Update Status">
                        <IconButton size="small" id={`update-status-${w.id}`} onClick={() => setUpdateTarget(w)}>
                          <UpdateIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View History">
                        <IconButton size="small" id={`view-history-${w.id}`} onClick={() => handleViewHistory(w)} disabled={histLoading}>
                          <HistoryIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
      </Paper>

      <UpdateStatusDialog open={!!updateTarget} onClose={() => setUpdateTarget(null)}
        onSave={handleUpdateStatus} workOrder={updateTarget} loading={updating} />

      <HistoryDialog open={!!historyTarget} onClose={() => { setHistoryTarget(null); setHistory([]); }}
        history={history} workOrder={historyTarget} />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default WorkTrackingPage;
