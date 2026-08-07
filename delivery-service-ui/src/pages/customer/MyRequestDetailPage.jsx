import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Grid, Card, CardContent,
  Divider, Stack, Chip, Stepper, Step, StepLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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
import EditRequestDialog from './EditRequestDialog';
import CancelRequestDialog from './CancelRequestDialog';

const WORKFLOW_STEPS = ['NEW', 'ASSIGNED', 'STARTED', 'IN_PROGRESS', 'COMPLETED'];

const MyRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: customer, execute: loadCustomer } = useApi(customerService.getCurrentCustomer);
  const { data: sites, execute: loadSites } = useApi(siteService.getByCustomer);
  const { execute: updateRequest, loading: updating } = useApi(workOrderService.update);
  const { execute: cancelRequest, loading: cancelling } = useApi(workOrderService.cancel);

  const [workOrder, setWorkOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [woRes, tlRes, histRes] = await Promise.all([
        workOrderService.getById(id),
        trackingService.getTimeline(id),
        trackingService.getStatusHistory(id),
      ]);

      const woData = woRes.data?.data ?? woRes.data ?? woRes;
      const tlData = tlRes.data?.data ?? tlRes.data ?? tlRes;
      const histData = histRes.data?.data ?? histRes.data ?? histRes;

      setWorkOrder(woData);
      setTimeline(tlData);
      setHistory(Array.isArray(histData) ? histData : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load work order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    loadCustomer();
  }, [fetchDetails, loadCustomer]);

  useEffect(() => {
    if (customer?.id) {
      loadSites(customer.id);
    }
  }, [customer, loadSites]);

  const handleEditSubmit = async (payload) => {
    try {
      await updateRequest(id, payload);
      showSuccess('Service request updated successfully!');
      setEditOpen(false);
      fetchDetails();
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update request.');
    }
  };

  const handleCancelConfirm = async (cancellationReason) => {
    try {
      // Correctly calls PUT /api/workorders/{id}/cancel with WorkOrderCancelDTO body
      await cancelRequest(id, { cancellationReason });
      showSuccess('Service request cancelled.');
      setCancelOpen(false);
      fetchDetails();
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to cancel request.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading service request details..." />;
  if (error || !workOrder) return <ErrorState message={error || 'Work order not found.'} onRetry={fetchDetails} />;

  // Calculate active step index for workflow stepper
  let activeStep = WORKFLOW_STEPS.indexOf(workOrder.status);
  if (workOrder.status === 'ON_HOLD' || workOrder.status === 'RESUMED') {
    activeStep = 3;
  } else if (workOrder.status === 'CANCELLED') {
    activeStep = -1;
  }

  const isNew = workOrder.status === 'NEW';
  const isCancellable = workOrder.status === 'NEW' || workOrder.status === 'ASSIGNED';

  return (
    <Box className="fade-in">
      {/* Top Header & Actions */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-requests')}
          variant="outlined"
          size="small"
          id="back-to-my-requests"
        >
          Back to My Requests
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E0E7EF' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Chip label={workOrder.workOrderNumber} color="primary" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
              <StatusChip status={workOrder.status} />
              <PriorityChip priority={workOrder.priority} />
            </Stack>
            <Typography variant="h5" fontWeight={800} color="#1a1a2e">
              {workOrder.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created on {formatDateTime(workOrder.createdAt)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            {isNew && (
              <Button
                variant="outlined"
                color="info"
                startIcon={<EditIcon />}
                onClick={() => setEditOpen(true)}
                id="detail-edit-btn"
              >
                Edit Request
              </Button>
            )}

            {isCancellable && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelOpen(true)}
                id="detail-cancel-btn"
              >
                Cancel Request
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Left Column — 8 cols */}
        <Grid item xs={12} md={8}>
          {/* Request Overview */}
          <Card sx={{ borderRadius: 3, mb: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Request Overview
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3, color: '#333' }}>
                {workOrder.description || 'No detailed description provided.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <LocationOnIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Site Location</Typography>
                      <Typography variant="body2" fontWeight={600}>{workOrder.siteName} ({workOrder.siteCode})</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <AccessTimeIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDateTime(workOrder.updatedAt)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Workflow Stepper Timeline */}
          <Card sx={{ borderRadius: 3, mb: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Request Progress
              </Typography>

              {workOrder.status === 'CANCELLED' ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  This service request has been <strong>CANCELLED</strong>.
                </Alert>
              ) : (
                <Stepper activeStep={activeStep} alternativeLabel>
                  {WORKFLOW_STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
            </CardContent>
          </Card>

          {/* History Log */}
          <Card sx={{ borderRadius: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Status History & Activity Log
                </Typography>
              </Stack>

              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No status updates recorded yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Previous</TableCell>
                        <TableCell>New Status</TableCell>
                        <TableCell>Updated By</TableCell>
                        <TableCell>Remarks / Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((h) => (
                        <TableRow key={h.id} hover>
                          <TableCell><Typography variant="caption">{formatDateTime(h.timestamp)}</Typography></TableCell>
                          <TableCell><StatusChip status={h.previousStatus} size="small" /></TableCell>
                          <TableCell><StatusChip status={h.newStatus} size="small" /></TableCell>
                          <TableCell><Typography variant="body2">{h.updatedByName || 'System'}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {h.remarks || h.cancellationReason || h.holdReason || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column — 4 cols */}
        <Grid item xs={12} md={4}>
          {/* Technician Details */}
          <Card sx={{ borderRadius: 3, mb: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <EngineeringIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Assigned Technician
                </Typography>
              </Stack>

              {workOrder.assignedTechnicianName ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#1565C0', fontWeight: 700 }}>
                    {workOrder.assignedTechnicianName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      {workOrder.assignedTechnicianName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workOrder.assignedTechnicianEmail}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  A technician will be assigned to your request shortly by our dispatch team.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Dispatcher Details */}
          <Card sx={{ borderRadius: 3, mb: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <SupportAgentIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Dispatch Manager
                </Typography>
              </Stack>

              {workOrder.dispatcherName ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#00838F', fontWeight: 700 }}>
                    {workOrder.dispatcherName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      {workOrder.dispatcherName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workOrder.dispatcherEmail}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Automated dispatch routing active.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* SLA Overview */}
          <Card sx={{ borderRadius: 3, border: '1px solid #E0E7EF' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <VerifiedUserIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Service Level Agreement (SLA)
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" mb={1.5}>
                Priority level: <strong>{workOrder.priority}</strong>
              </Typography>
              <Chip
                label={`Target SLA: ${workOrder.priority === 'URGENT' ? '2 Hours' : workOrder.priority === 'HIGH' ? '4 Hours' : '24 Hours'}`}
                color={workOrder.priority === 'URGENT' ? 'error' : workOrder.priority === 'HIGH' ? 'warning' : 'info'}
                sx={{ fontWeight: 700 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <EditRequestDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        loading={updating}
        sites={sites || []}
        request={workOrder}
      />

      <CancelRequestDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
        requestNumber={workOrder.workOrderNumber}
      />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default MyRequestDetailPage;
