import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Stack, MenuItem, Select,
  FormControl, InputLabel, Chip, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import StatusChip from '@/components/StatusChip';
import PriorityChip from '@/components/PriorityChip';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import workOrderService from '@/services/workOrderService';
import trackingService from '@/services/trackingService';
import customerService from '@/services/customerService';
import siteService from '@/services/siteService';
import { formatDateTime } from '@/utils/helpers';
import RaiseRequestDialog from './RaiseRequestDialog';
import EditRequestDialog from './EditRequestDialog';
import CancelRequestDialog from './CancelRequestDialog';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: customer, loading: loadingCustomer, error: customerError, execute: loadCustomer } = useApi(customerService.getCurrentCustomer);
  const { data: sites, execute: loadSites } = useApi(siteService.getByCustomer);
  const { execute: createRequest, loading: creating } = useApi(workOrderService.create);
  const { execute: updateRequest, loading: updating } = useApi(workOrderService.update);
  const { execute: cancelRequest, loading: cancelling } = useApi(trackingService.updateStatus);

  const [myRequests, setMyRequests] = useState([]);
  const [loadingWO, setLoadingWO] = useState(false);
  const [woError, setWoError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchMyRequests = useCallback(async (customerId) => {
    if (!customerId) return;
    setLoadingWO(true);
    setWoError(null);
    try {
      const res = await workOrderService.getById(`customer/${customerId}`);
      const data = res.data?.data ?? res.data ?? res;
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setWoError(err?.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoadingWO(false);
    }
  }, []);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    if (customer?.id) {
      fetchMyRequests(customer.id);
      loadSites(customer.id);
    }
  }, [customer, fetchMyRequests, loadSites]);

  const handleCreateSubmit = async (payload) => {
    try {
      await createRequest(payload);
      showSuccess('Service request raised successfully!');
      setDialogOpen(false);
      if (customer?.id) {
        fetchMyRequests(customer.id);
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to submit service request.');
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      await updateRequest(editTarget.id, payload);
      showSuccess('Service request updated successfully!');
      setEditTarget(null);
      if (customer?.id) {
        fetchMyRequests(customer.id);
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update service request.');
    }
  };

  const handleCancelConfirm = async (cancellationReason) => {
    try {
      // Correctly calls PUT /api/workorders/{id}/cancel with WorkOrderCancelDTO body
      await workOrderService.cancel(cancelTarget.id, { cancellationReason });
      showSuccess('Service request cancelled.');
      setCancelTarget(null);
      if (customer?.id) {
        fetchMyRequests(customer.id);
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to cancel service request.');
    }
  };

  const filtered = (myRequests || []).filter((w) => {
    const matchSearch = [w.workOrderNumber, w.title, w.siteName]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loadingCustomer || loadingWO) return <LoadingSpinner message="Loading your service requests..." />;
  if (customerError || woError) return <ErrorState message={customerError || woError} onRetry={() => loadCustomer()} />;

  return (
    <Box className="fade-in">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            My Service Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customer ? `${customer.customerName} (${customer.customerCode})` : 'Track and manage your requests'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          id="raise-request-btn"
          onClick={() => setDialogOpen(true)}
        >
          Raise Service Request
        </Button>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search my requests..."
            size="small"
            value={search}
            id="my-req-search"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              id="my-req-status-filter"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>WO Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Technician</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <AssignmentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>
                        {search || statusFilter ? 'No requests match your filter.' : 'You have not raised any service requests yet.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((w) => (
                  <TableRow
                    key={w.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/my-requests/${w.id}`)}
                  >
                    <TableCell>
                      <Chip label={w.workOrderNumber} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 220 }} noWrap>
                        {w.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{w.siteName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={w.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={w.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{w.assignedTechnicianName || 'Not Assigned Yet'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{w.createdAt ? formatDateTime(w.createdAt) : '—'}</Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/my-requests/${w.id}`)}
                            id={`view-req-${w.id}`}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {w.status === 'NEW' && (
                          <Tooltip title="Edit Request">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => setEditTarget(w)}
                              id={`edit-req-${w.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {(w.status === 'NEW' || w.status === 'ASSIGNED') && (
                          <Tooltip title="Cancel Request">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setCancelTarget(w)}
                              id={`cancel-req-${w.id}`}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
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

      <RaiseRequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={creating}
        sites={sites || []}
        customer={customer}
      />

      <EditRequestDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        loading={updating}
        sites={sites || []}
        request={editTarget}
      />

      <CancelRequestDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
        requestNumber={cancelTarget?.workOrderNumber}
      />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default MyRequestsPage;
