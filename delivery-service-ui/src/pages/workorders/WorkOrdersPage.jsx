import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, TablePagination, Stack, MenuItem, Select,
  FormControl, InputLabel, Chip, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AssignmentIcon from '@mui/icons-material/Assignment';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import StatusChip from '@/components/StatusChip';
import PriorityChip from '@/components/PriorityChip';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import workOrderService from '@/services/workOrderService';
import customerService from '@/services/customerService';
import siteService from '@/services/siteService';
import authService from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/helpers';
import { PRIORITIES } from '@/utils/constants';

const EMPTY_FORM = {
  title: '', description: '', priority: 'MEDIUM',
  customerId: '', siteId: '', technicianId: '', scheduledDate: '',
};

const WOFormDialog = ({ open, onClose, onSave, initial, loading, customers, sites, technicians }) => {
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm({ defaultValues: initial || EMPTY_FORM });
  const isEdit = !!initial?.id;

  useEffect(() => { reset(initial || EMPTY_FORM); }, [initial, reset]);

  const selectedCustomerId = watch('customerId');
  const filteredSites = (sites || []).filter(s => !selectedCustomerId || String(s.customerId || s.customer?.id) === String(selectedCustomerId));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700}>{isEdit ? 'Edit Work Order' : 'Create Work Order'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent dividers sx={{ overflowY: 'visible' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                placeholder="Enter work order title (e.g. AC Cooling Unit Inspection)"
                helperText={errors.title?.message || "Concise summary of the task required"}
                {...register('title', { required: 'Work order title is required' })}
                error={!!errors.title}
                id="wo-title-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Provide detailed scope of work or issue description..."
                helperText="Detailed description of the issue or instructions"
                multiline
                rows={3}
                {...register('description')}
                id="wo-desc-input"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority *"
                defaultValue="MEDIUM"
                helperText="Select priority level"
                {...register('priority', { required: 'Priority is required' })}
                error={!!errors.priority}
                id="wo-priority-select"
              >
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="datetime-local"
                helperText="Expected start date and time"
                InputLabelProps={{ shrink: true }}
                {...register('scheduledDate')}
                id="wo-scheduled-date"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="customerId"
                control={control}
                rules={{ required: 'Customer selection is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedCustomer = (customers || []).find(c => String(c.id) === String(value)) || null;
                  return (
                    <Autocomplete
                      options={customers || []}
                      getOptionLabel={(option) => option ? `${option.customerName} (${option.customerCode})` : ''}
                      value={selectedCustomer}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.id : '');
                      }}
                      isOptionEqualToValue={(option, val) => String(option.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Customer *"
                          placeholder="Select customer"
                          error={!!error}
                          helperText={error?.message || "Target client company"}
                          id="wo-customer-select"
                        />
                      )}
                      slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="siteId"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedSite = (filteredSites || []).find(s => String(s.id) === String(value)) || null;
                  return (
                    <Autocomplete
                      options={filteredSites || []}
                      getOptionLabel={(option) => option ? `${option.siteName} (${option.siteCode})` : ''}
                      value={selectedSite}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.id : '');
                      }}
                      isOptionEqualToValue={(option, val) => String(option.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Site"
                          placeholder="Select site (optional)"
                          error={!!error}
                          helperText={error?.message || "Specific facility or site location"}
                          id="wo-site-select"
                        />
                      )}
                      slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="technicianId"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedTech = (technicians || []).find(t => String(t.id) === String(value)) || null;
                  return (
                    <Autocomplete
                      options={technicians || []}
                      getOptionLabel={(option) => option ? `${option.userName} (${option.userEmail})` : ''}
                      value={selectedTech}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.id : '');
                      }}
                      isOptionEqualToValue={(option, val) => String(option.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned Technician"
                          placeholder="Select technician (optional)"
                          error={!!error}
                          helperText={error?.message || "Technician assigned to fulfill this work order"}
                          id="wo-technician-select"
                        />
                      )}
                      slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="wo-form-cancel">Cancel</Button>
          <Button type="submit" variant="contained" id="wo-form-save" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Work Order' : 'Create Work Order'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle fontWeight={700}>{title}</DialogTitle>
    <DialogContent><Typography>{message}</Typography></DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" id="confirm-cancel">Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="error" id="confirm-delete" disabled={loading}>
        {loading ? 'Processing...' : 'Deactivate'}
      </Button>
    </DialogActions>
  </Dialog>
);

const WorkOrdersPage = () => {
  const { isManager, isDispatcher, isTechnician } = useAuth();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: workOrders, loading, error, execute: loadWOs } = useApi(workOrderService.getAll);
  const { data: customers, execute: loadCustomers } = useApi(customerService.getAll);
  const { data: sites, execute: loadSites } = useApi(siteService.getAll);
  const { data: technicians, execute: loadTechnicians } = useApi(authService.getTechnicians);
  const { execute: createWO, loading: creating } = useApi(workOrderService.create);
  const { execute: updateWO, loading: updating } = useApi(workOrderService.update);
  const { execute: deleteWO, loading: deleting } = useApi(workOrderService.delete);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadWOs(); loadCustomers(); loadSites(); loadTechnicians();
  }, [loadWOs, loadCustomers, loadSites, loadTechnicians]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(0);
  };

  const filtered = (workOrders || []).filter(w => {
    const matchSearch = [w.workOrderNumber, w.title, w.customerName, w.assignedTechnicianName]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || w.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const canEdit = isManager || isDispatcher;

  const handleCreate = useCallback(async (data) => {
    try {
      await createWO({
        ...data,
        customerId: Number(data.customerId),
        siteId: data.siteId ? Number(data.siteId) : null,
        assignedTechnicianId: data.technicianId ? Number(data.technicianId) : null,
      });
      showSuccess(data.technicianId ? 'Work order created and technician assigned' : 'Work order created successfully');
      setFormOpen(false);
      await loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to create work order'); }
  }, [createWO, loadWOs, showSuccess, showError]);

  const handleUpdate = useCallback(async (data) => {
    try {
      await updateWO(editTarget.id, {
        ...data,
        technicianId: data.technicianId ? Number(data.technicianId) : null,
      });
      showSuccess(data.technicianId ? 'Assignment successful' : 'Work order updated successfully');
      setFormOpen(false); setEditTarget(null);
      await loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to update work order'); }
  }, [updateWO, editTarget, loadWOs, showSuccess, showError]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteWO(deleteTarget.id);
      showSuccess('Work order deactivated successfully');
      setDeleteTarget(null);
      loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to deactivate work order'); }
  }, [deleteWO, deleteTarget, loadWOs, showSuccess, showError]);

  const handleStart = async (id) => {
    try {
      await workOrderService.updateStatus(id, { newStatus: 'STARTED', remarks: 'Work started' });
      showSuccess('Work started successfully'); loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to start work'); }
  };

  const handleHold = async (id) => {
    try {
      await workOrderService.hold(id, { holdReason: 'On hold by technician' });
      showSuccess('Work placed on hold'); loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to put on hold'); }
  };

  const handleResume = async (id) => {
    try {
      await workOrderService.updateStatus(id, { newStatus: 'RESUMED', remarks: 'Work resumed' });
      showSuccess('Work resumed successfully'); loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to resume work'); }
  };

  const handleComplete = async (id) => {
    try {
      await workOrderService.complete(id, { resolutionSummary: 'Work completed by technician' });
      showSuccess('Work completed successfully'); loadWOs();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to complete work order'); }
  };

  if (loading) return <LoadingSpinner message="Loading work orders..." />;
  if (error) return <ErrorState message={error} onRetry={loadWOs} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Work Orders</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} work order(s) found</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadWOs} id="wo-refresh-btn">
            Refresh
          </Button>
          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} id="add-wo-btn"
              onClick={() => { setEditTarget(null); setFormOpen(true); }}>
              New Work Order
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField placeholder="Search by WO number, title, customer..." size="small" value={search} id="wo-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} label="Status Filter" id="wo-status-filter"
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">All Statuses</MenuItem>
              {['NEW', 'ASSIGNED', 'STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map(s =>
                <MenuItem key={s} value={s}>{s}</MenuItem>
              )}
            </Select>
          </FormControl>
          {(search || statusFilter) && (
            <Button variant="text" color="secondary" startIcon={<FilterAltOffIcon />} onClick={handleResetFilters} id="wo-reset-filters">
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
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <AssignmentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>{search || statusFilter ? 'No work orders match your filter.' : 'No work orders yet.'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell><Chip label={w.workOrderNumber} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 200 }} noWrap>{w.title}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{w.customerName || '—'}</Typography></TableCell>
                  <TableCell><PriorityChip priority={w.priority} /></TableCell>
                  <TableCell><StatusChip status={w.status} /></TableCell>
                  <TableCell><Typography variant="body2">{w.assignedTechnicianName || '—'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{w.scheduledDate ? formatDateTime(w.scheduledDate) : '—'}</Typography></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">

                      {(w.status === 'ASSIGNED' || w.status === 'NEW') && isTechnician && (
                        <Button size="small" variant="contained" color="success"
                          onClick={() => handleStart(w.id)} id={`start-${w.id}`}>
                          Start
                        </Button>
                      )}

                      {(w.status === 'STARTED' || w.status === 'IN_PROGRESS' || w.status === 'RESUMED') && isTechnician && (
                        <>
                          <Button size="small" color="warning" variant="contained"
                            onClick={() => handleHold(w.id)} id={`hold-${w.id}`}>
                            Hold
                          </Button>
                          <Button size="small" color="success" variant="contained"
                            onClick={() => handleComplete(w.id)} id={`complete-${w.id}`}>
                            Complete
                          </Button>
                        </>
                      )}

                      {w.status === 'ON_HOLD' && isTechnician && (
                        <Button size="small" color="primary" variant="contained"
                          onClick={() => handleResume(w.id)} id={`resume-${w.id}`}>
                          Resume
                        </Button>
                      )}

                      {canEdit && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            id={`edit-wo-${w.id}`}
                            onClick={() => {
                              setEditTarget({
                                ...w,
                                customerId: w.customerId,
                                siteId: w.siteId,
                                technicianId: w.assignedTechnicianId || '',
                              });
                              setFormOpen(true);
                            }}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {isManager && (
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(w)}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      )}

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

      <WOFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleUpdate : handleCreate} initial={editTarget}
        loading={creating || updating} customers={customers || []} sites={sites || []} technicians={technicians || []} />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Deactivate Work Order" message={`Are you sure you want to deactivate "${deleteTarget?.workOrderNumber}"?`}
        loading={deleting} />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default WorkOrdersPage;
