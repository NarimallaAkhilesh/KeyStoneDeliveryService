import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TablePagination, TextField, InputAdornment,
  Stack, Alert, Card, CardContent, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import StatCard from '@/components/StatCard';
import useApi from '@/hooks/useApi';
import slaService from '@/services/slaService';
import { formatDateTime, formatPercent } from '@/utils/helpers';

const SLAPage = () => {
  const { data: dashboard, loading: dLoading, error: dError, execute: loadDash } = useApi(slaService.getDashboard);
  const { data: breaches, loading: bLoading, execute: loadBreaches } = useApi(slaService.getBreaches);
  const { data: upcoming, loading: uLoading, execute: loadUpcoming } = useApi(slaService.getUpcoming);

  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(0);
  const [rowsPerPage]       = useState(10);

  const handleRefresh = () => {
    loadDash();
    loadBreaches();
    loadUpcoming();
  };

  useEffect(() => { handleRefresh(); }, [loadDash, loadBreaches, loadUpcoming]);

  const db = dashboard || {};
  const filteredBreaches = (breaches || []).filter(b =>
    [b.workOrder?.workOrderNumber, b.workOrder?.title]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filteredBreaches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (dLoading) return <LoadingSpinner message="Loading SLA data..." />;
  if (dError)   return <ErrorState message={dError} onRetry={handleRefresh} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>SLA Tracking</Typography>
          <Typography variant="body2" color="text.secondary">
            Service Level Agreement compliance and breach monitoring
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} id="sla-refresh-btn">
          Refresh
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Total SLAs" value={db.totalSLAHistories ?? '—'} icon={<VerifiedIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="SLA Compliance" value={formatPercent(db.slaCompliancePercentage)} icon={<CheckCircleIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Response Breaches" value={db.responseBreachedCount ?? '—'} icon={<ErrorIcon />} color="#C62828" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Resolution Breaches" value={db.resolutionBreachedCount ?? '—'} icon={<WarningAmberIcon />} color="#E65100" />
        </Grid>
      </Grid>

      {/* Upcoming Deadlines Alert */}
      {(upcoming || []).length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          <strong>{(upcoming || []).length} work order(s)</strong> have SLA deadlines in the next 2 hours.
        </Alert>
      )}

      {/* Upcoming Deadlines Quick Cards */}
      {(upcoming || []).length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>⏰ Upcoming Deadlines (Next 2 Hours)</Typography>
          <Grid container spacing={2}>
            {(upcoming || []).slice(0, 4).map((u) => (
              <Grid item xs={12} sm={6} md={3} key={u.id}>
                <Card sx={{ borderRadius: 2.5, border: '1.5px solid #FF9800', bgcolor: '#FFF8E1' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" fontWeight={700}>{u.workOrder?.workOrderNumber}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{u.workOrder?.title}</Typography>
                    <Typography variant="caption" color="error.main" fontWeight={600}>
                      Deadline: {formatDateTime(u.resolutionDeadline)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Breaches Table */}
      <Typography variant="subtitle1" fontWeight={700} mb={1.5}>🔴 SLA Breaches</Typography>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField placeholder="Search breaches by WO number, title..." size="small" value={search} id="sla-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ width: { xs: '100%', sm: 320 } }} />
          {search && (
            <Button variant="text" color="secondary" startIcon={<FilterAltOffIcon />} onClick={() => setSearch('')} id="sla-reset-search">
              Clear Search
            </Button>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Work Order</TableCell>
                <TableCell>Response Deadline</TableCell>
                <TableCell>Resolution Deadline</TableCell>
                <TableCell>Response Breached</TableCell>
                <TableCell>Resolution Breached</TableCell>
                <TableCell>Breach Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <CheckCircleIcon sx={{ fontSize: 48, color: '#2E7D32', opacity: 0.5 }} />
                      <Typography>{search ? 'No breaches match search.' : 'No SLA breaches. Great work!'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((b) => (
                <TableRow key={b.id} hover sx={{ bgcolor: '#FFF5F5' }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{b.workOrder?.workOrderNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">{b.workOrder?.title}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="caption">{formatDateTime(b.responseDeadline)}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{formatDateTime(b.resolutionDeadline)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={b.responseBreached ? 'Breached' : 'OK'} size="small"
                      color={b.responseBreached ? 'error' : 'success'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={b.resolutionBreached ? 'Breached' : 'OK'} size="small"
                      color={b.resolutionBreached ? 'error' : 'success'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell><Typography variant="caption" color="error">{b.breachReason || '—'}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredBreaches.length} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
      </Paper>
    </Box>
  );
};

export default SLAPage;
