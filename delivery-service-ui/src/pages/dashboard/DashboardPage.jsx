import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Box, Typography, Card, CardContent,
  Button, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EngineeringIcon from '@mui/icons-material/Engineering';
import TodayIcon from '@mui/icons-material/Today';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import StatusChip from '@/components/StatusChip';
import PriorityChip from '@/components/PriorityChip';
import useApi from '@/hooks/useApi';
import dashboardService from '@/services/dashboardService';
import customerService from '@/services/customerService';
import workOrderService from '@/services/workOrderService';
import siteService from '@/services/siteService';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/helpers';
import RaiseRequestDialog from '../customer/RaiseRequestDialog';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { data: customer, loading: loadingCust, execute: loadCustomer } = useApi(customerService.getCurrentCustomer);
  const { data: sites, execute: loadSites } = useApi(siteService.getByCustomer);
  const { execute: createRequest, loading: creating } = useApi(workOrderService.create);

  const [myRequests, setMyRequests] = useState([]);
  const [loadingWO, setLoadingWO] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { loadCustomer(); }, [loadCustomer]);

  useEffect(() => {
    if (customer?.id) {
      loadSites(customer.id);
      setLoadingWO(true);
      workOrderService.getCustomerWorkOrders(customer.id)
        .then((res) => {
          const data = res.data?.data ?? res.data ?? res;
          setMyRequests(Array.isArray(data) ? data : []);
        })
        .catch(() => setMyRequests([]))
        .finally(() => setLoadingWO(false));
    }
  }, [customer, loadSites]);

  const handleCreateSubmit = async (payload) => {
    try {
      await createRequest(payload);
      setDialogOpen(false);
      if (customer?.id) {
        setLoadingWO(true);
        const res = await workOrderService.getCustomerWorkOrders(customer.id);
        const data = res.data?.data ?? res.data ?? res;
        setMyRequests(Array.isArray(data) ? data : []);
        setLoadingWO(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingCust || loadingWO) return <LoadingSpinner message="Loading customer portal dashboard..." />;

  const total = myRequests.length;
  const newOpen = myRequests.filter((r) => r.status === 'NEW' || r.status === 'ASSIGNED').length;
  const inProgress = myRequests.filter((r) => r.status === 'STARTED' || r.status === 'IN_PROGRESS' || r.status === 'RESUMED').length;
  const completed = myRequests.filter((r) => r.status === 'COMPLETED').length;
  const cancelled = myRequests.filter((r) => r.status === 'CANCELLED').length;

  const recent = myRequests.slice(0, 5);

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1a1a2e">
            Welcome back, {customer?.customerName || 'Valued Customer'}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Service Portal & Request Overview ({customer?.customerCode})
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => navigate('/my-requests')} id="cust-view-all-btn">
            View All Requests
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} id="cust-raise-btn">
            Raise Request
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Total Raised" value={total} icon={<AssignmentIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Open / Pending" value={newOpen} icon={<AccessTimeIcon />} color="#F57F17" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="In Progress" value={inProgress} icon={<EngineeringIcon />} color="#E65100" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Completed" value={completed} icon={<CheckCircleIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Cancelled" value={cancelled} icon={<CancelIcon />} color="#C62828" />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF', p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Recent Service Requests
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>WO Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No service requests raised yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((w) => (
                  <TableRow
                    key={w.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/my-requests/${w.id}`)}
                  >
                    <TableCell>
                      <Chip label={w.workOrderNumber} size="small" sx={{ fontFamily: 'monospace' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{w.title}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{w.siteName || '—'}</Typography></TableCell>
                    <TableCell><PriorityChip priority={w.priority} /></TableCell>
                    <TableCell><StatusChip status={w.status} /></TableCell>
                    <TableCell><Typography variant="body2">{w.assignedTechnicianName || 'Pending'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{formatDateTime(w.createdAt)}</Typography></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RaiseRequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={creating}
        sites={sites || []}
        customer={customer}
      />
    </Box>
  );
};

const DashboardPage = () => {
  const { isCustomer } = useAuth();
  const { data: summary, loading, error, execute } = useApi(dashboardService.getSummary);

  useEffect(() => {
    if (!isCustomer) {
      execute();
    }
  }, [isCustomer, execute]);

  if (isCustomer) {
    return <CustomerDashboard />;
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={execute} />;

  const s = summary || {};
  const totalWO = s.totalWorkOrders || 0;
  const completionRate = totalWO > 0 ? Math.round((s.completedWorkOrders / totalWO) * 100) : 0;

  return (
    <Box className="fade-in">
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800} color="#1a1a2e">
          System Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Live metrics across all modules
        </Typography>
      </Box>

      {/* Customers & Sites */}
      <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
        Customers & Sites
      </Typography>
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Customers" value={s.totalCustomers ?? '—'} icon={<PeopleIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Customers" value={s.activeCustomers ?? '—'} icon={<PeopleIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Sites" value={s.totalSites ?? '—'} icon={<LocationOnIcon />} color="#00838F" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Sites" value={s.activeSites ?? '—'} icon={<LocationOnIcon />} color="#6A1B9A" />
        </Grid>
      </Grid>

      {/* Work Orders */}
      <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
        Work Orders
      </Typography>
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Total" value={s.totalWorkOrders ?? '—'} icon={<AssignmentIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Open" value={s.openWorkOrders ?? '—'} icon={<AssignmentIcon />} color="#0097A7" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Assigned" value={s.assignedWorkOrders ?? '—'} icon={<EngineeringIcon />} color="#F57F17" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="In Progress" value={s.inProgressWorkOrders ?? '—'} icon={<AccessTimeIcon />} color="#E65100" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Completed" value={s.completedWorkOrders ?? '—'} icon={<CheckCircleIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Cancelled" value={s.cancelledWorkOrders ?? '—'} icon={<CancelIcon />} color="#C62828" />
        </Grid>
      </Grid>

      {/* Completion Rate Card */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #E0E7EF' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Work Order Completion Rate</Typography>
              <Typography variant="body2" color="text.secondary">Completed vs Total Work Orders</Typography>
            </Box>
            <Chip
              label={`${completionRate}%`}
              color={completionRate >= 70 ? 'success' : completionRate >= 40 ? 'warning' : 'error'}
              sx={{ fontWeight: 700, fontSize: '1rem', px: 1 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 10, borderRadius: 5,
              bgcolor: '#E0E7EF',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: completionRate >= 70
                  ? 'linear-gradient(90deg,#43A047,#2E7D32)'
                  : completionRate >= 40
                    ? 'linear-gradient(90deg,#FFA726,#F57F17)'
                    : 'linear-gradient(90deg,#EF5350,#C62828)',
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">0</Typography>
            <Typography variant="caption" color="text.secondary">{s.totalWorkOrders ?? 0} total</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Today + SLA + Inventory + Technicians */}
      <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
        Today & Monitoring
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Today's Orders" value={s.todaysWorkOrders ?? '—'} icon={<TodayIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Today Completed" value={s.todaysCompletedWorkOrders ?? '—'} icon={<CheckCircleIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="SLA Breaches" value={s.slaBreaches ?? '—'} icon={<WarningAmberIcon />} color="#C62828" subtitle="Requires attention" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Upcoming Deadlines" value={s.upcomingSLADeadlines ?? '—'} icon={<AccessTimeIcon />} color="#F57F17" subtitle="Next 2 hours" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Total Parts" value={s.totalParts ?? '—'} icon={<BuildIcon />} color="#00838F" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Low Stock Parts" value={s.lowStockParts ?? '—'} icon={<WarningAmberIcon />} color="#E65100" subtitle="Need restocking" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="Total Technicians" value={s.totalTechnicians ?? '—'} icon={<EngineeringIcon />} color="#6A1B9A" />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard title="On Hold" value={s.onHoldWorkOrders ?? '—'} icon={<AccessTimeIcon />} color="#455A64" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
