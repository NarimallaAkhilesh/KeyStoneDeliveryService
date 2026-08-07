import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, TablePagination, Stack, MenuItem, Tab, Tabs, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import StatusChip from '@/components/StatusChip';
import PriorityChip from '@/components/PriorityChip';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import trackingService from '@/services/trackingService';
import workOrderService from '@/services/workOrderService';
import authService from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/helpers';

/**
 * AssignDialog – sends { technicianId } to:
 *   POST /api/workorders/{woId}/assign   (new assignment)
 *   PUT  /api/workorders/{woId}/reassign (reassignment)
 */
const AssignDialog = ({ open, onClose, onSave, initial, loading, workOrders, technicians }) => {
  const { handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: { workOrderId: initial?.id || '', technicianId: '' }
  });
  const isReassign = !!initial;

  useEffect(() => {
    if (open) reset({ workOrderId: initial?.id || '', technicianId: '' });
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700}>
        {isReassign ? `Reassign – ${initial?.workOrderNumber}` : 'Assign Technician to Work Order'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent dividers sx={{ overflowY: 'visible' }}>
          <Grid container spacing={2.5}>
            {!isReassign && (
              <Grid item xs={12}>
                <Controller
                  name="workOrderId"
                  control={control}
                  rules={{ required: 'Work order selection is required' }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    const selectedWO = (workOrders || []).find(w => String(w.id) === String(value)) || null;
                    return (
                      <Autocomplete
                        options={workOrders || []}
                        getOptionLabel={(option) => option ? `${option.workOrderNumber} - ${option.title} (${option.customerName || 'No Client'})` : ''}
                        value={selectedWO}
                        onChange={(_, newValue) => {
                          onChange(newValue ? newValue.id : '');
                        }}
                        isOptionEqualToValue={(option, val) => String(option.id) === String(val.id)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Work Order *"
                            placeholder="Search and select work order"
                            error={!!error}
                            helperText={error?.message || "Select work order pending assignment"}
                            id="assign-wo-select"
                          />
                        )}
                        slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                      />
                    );
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="technicianId"
                control={control}
                rules={{ required: 'Technician selection is required' }}
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
                          label="Assigned Technician *"
                          placeholder="Search technician by name or email"
                          error={!!error}
                          helperText={error?.message || "Select field service technician to perform work"}
                          id="assign-tech-select"
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
          <Button onClick={onClose} variant="outlined" id="assign-cancel">Cancel</Button>
          <Button type="submit" variant="contained" id="assign-save" disabled={loading}>
            {loading ? 'Saving...' : isReassign ? 'Reassign' : 'Assign'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const TechnicianAssignmentPage = () => {
  const { isManager, isDispatcher } = useAuth();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: workOrders, loading, error, execute: loadWOs } = useApi(workOrderService.getAll);
  const { data: techniciansRes, execute: loadTechnicians } = useApi(authService.getTechnicians);
  const { execute: assignTech,   loading: assigning }   = useApi(trackingService.assignTechnician);
  const { execute: reassignTech, loading: reassigning } = useApi(trackingService.reassign);

  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(0);
  const [rowsPerPage]                   = useState(10);
  const [assignOpen, setAssignOpen]     = useState(false);
  const [targetWO, setTargetWO]         = useState(null);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [tab, setTab]                   = useState(0); // 0=Pending, 1=Active Assignments

  useEffect(() => {
    loadWOs();
    loadTechnicians();
  }, [loadWOs, loadTechnicians]);

  const technicians = techniciansRes || [];
  const canManage = isManager || isDispatcher;

  // Tab 0: NEW work orders pending assignment
  const pendingWOs = (workOrders || []).filter(w => w.status === 'NEW');

  // Tab 1: Work orders that already have an active assignment
  const assignedWOs = (workOrders || []).filter(w =>
    ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'STARTED', 'RESUMED'].includes(w.status)
  );

  const currentList = tab === 0 ? pendingWOs : assignedWOs;

  const filtered = currentList.filter(w =>
    [w.workOrderNumber, w.title, w.assignedTechnicianName, w.customerName]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAssign = useCallback(async (data) => {
    try {
      const workOrderId = Number(data.workOrderId);
      const technicianId = Number(data.technicianId);
      await assignTech(workOrderId, { technicianId });
      showSuccess('Technician assigned successfully');
      setAssignOpen(false);
      setTargetWO(null);
      loadWOs();
    } catch (e) {
      showError(e?.response?.data?.message || 'Assignment failed. Check Work Order and Technician selection.');
    }
  }, [assignTech, loadWOs, showSuccess, showError]);

  const handleReassign = useCallback(async (data) => {
    try {
      const technicianId = Number(data.technicianId);
      await reassignTech(reassignTarget.id, { technicianId });
      showSuccess('Technician reassigned successfully');
      setReassignTarget(null);
      loadWOs();
    } catch (e) {
      showError(e?.response?.data?.message || 'Reassignment failed. Check Technician selection.');
    }
  }, [reassignTech, reassignTarget, loadWOs, showSuccess, showError]);

  if (loading) return <LoadingSpinner message="Loading assignments..." />;
  if (error)   return <ErrorState message={error} onRetry={loadWOs} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Technician Assignments</Typography>
          <Typography variant="body2" color="text.secondary">
            {pendingWOs.length} pending · {assignedWOs.length} active assignment(s)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadWOs} id="assign-refresh-btn">
            Refresh
          </Button>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} id="assign-tech-btn"
              onClick={() => { setTargetWO(null); setAssignOpen(true); }}>
              Assign Technician
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setPage(0); setSearch(''); }}
          sx={{ borderBottom: '1px solid #E0E7EF', px: 2 }}
        >
          <Tab
            label={`Pending Assignment (${pendingWOs.length})`}
            icon={<AssignmentIcon fontSize="small" />}
            iconPosition="start"
            id="tab-pending"
          />
          <Tab
            label={`Active Assignments (${assignedWOs.length})`}
            icon={<EngineeringIcon fontSize="small" />}
            iconPosition="start"
            id="tab-active"
          />
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF' }}>
          <TextField
            placeholder={tab === 0 ? 'Search pending work orders...' : 'Search active assignments...'}
            size="small"
            value={search}
            id="assign-search"
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
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                {tab === 1 && <TableCell>Assigned Technician</TableCell>}
                <TableCell>Scheduled</TableCell>
                {canManage && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? (tab === 1 ? 7 : 6) : (tab === 1 ? 6 : 5)} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      {tab === 0 ? (
                        <><AssignmentIcon sx={{ fontSize: 48, opacity: 0.3 }} /><Typography>{search ? 'No work orders match search.' : 'No work orders pending assignment.'}</Typography></>
                      ) : (
                        <><EngineeringIcon sx={{ fontSize: 48, opacity: 0.3 }} /><Typography>{search ? 'No assignments match search.' : 'No active assignments.'}</Typography></>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{w.workOrderNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">{w.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{w.customerName || '—'}</Typography>
                  </TableCell>
                  <TableCell><PriorityChip priority={w.priority} /></TableCell>
                  <TableCell><StatusChip status={w.status} /></TableCell>
                  {tab === 1 && (
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {w.assignedTechnicianName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {w.assignedTechnicianEmail || ''}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="caption">
                      {w.scheduledDate ? formatDateTime(w.scheduledDate) : '—'}
                    </Typography>
                  </TableCell>
                  {canManage && (
                    <TableCell align="center">
                      {tab === 0 ? (
                        <Tooltip title="Assign Technician">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EngineeringIcon />}
                            id={`assign-wo-${w.id}`}
                            onClick={() => {
                              setTargetWO(w);
                              setAssignOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Reassign Technician">
                          <IconButton
                            size="small"
                            id={`reassign-${w.id}`}
                            onClick={() => setReassignTarget(w)}
                          >
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
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

      {/* Assign new dialog */}
      <AssignDialog
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setTargetWO(null); }}
        onSave={handleAssign}
        initial={targetWO}
        loading={assigning}
        workOrders={pendingWOs}
        technicians={technicians}
      />

      {/* Reassign dialog */}
      <AssignDialog
        open={!!reassignTarget}
        onClose={() => setReassignTarget(null)}
        onSave={handleReassign}
        initial={reassignTarget}
        loading={reassigning}
        workOrders={workOrders}
        technicians={technicians}
      />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default TechnicianAssignmentPage;
