import { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Grid, Stack,
  LinearProgress, Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import StatCard from '@/components/StatCard';
import AppSnackbar from '@/components/AppSnackbar';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import dashboardService from '@/services/dashboardService';
import { formatPercent, formatHours, formatCurrency } from '@/utils/helpers';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import InventoryIcon from '@mui/icons-material/Inventory';
import VerifiedIcon from '@mui/icons-material/Verified';

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} pt={3}>{value === index && children}</Box>
);

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const [tab, setTab] = useState(0);
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const { data: techReport, loading: techLoading, error: techErr, execute: loadTech } = useApi(dashboardService.getTechnicianReport);
  const { data: custReport, loading: custLoading, error: custErr, execute: loadCust } = useApi(dashboardService.getCustomerReport);
  const { data: invReport,  loading: invLoading,  error: invErr,  execute: loadInv  } = useApi(dashboardService.getInventoryReport);
  const { data: slaReport,  loading: slaLoading,  error: slaErr,  execute: loadSLA  } = useApi(dashboardService.getSLAReport);

  const { execute: exportCSV }   = useApi(dashboardService.exportCSV);
  const { execute: exportExcel } = useApi(dashboardService.exportExcel);
  const { execute: exportPDF }   = useApi(dashboardService.exportPDF);

  useEffect(() => {
    loadTech(); loadCust(); loadInv(); loadSLA();
  }, [loadTech, loadCust, loadInv, loadSLA]);

  const REPORT_TYPE_MAP = ['TECHNICIAN', 'CUSTOMER', 'INVENTORY', 'SLA'];

  const handleExport = async (format) => {
    const reportType = REPORT_TYPE_MAP[tab];
    try {
      let res;
      if (format === 'CSV')   res = await exportCSV({ reportType, format: 'CSV' });
      if (format === 'EXCEL') res = await exportExcel({ reportType, format: 'EXCEL' });
      if (format === 'PDF')   res = await exportPDF({ reportType, format: 'PDF' });
      downloadBlob(res, `keystone-${reportType.toLowerCase()}-report.${format.toLowerCase()}`);
      showSuccess(`${reportType} report exported as ${format}`);
    } catch { showError('Export failed. Please try again.'); }
  };

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Performance insights across all modules</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} id="export-csv-btn" onClick={() => handleExport('CSV')}>CSV</Button>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} id="export-excel-btn" onClick={() => handleExport('EXCEL')}>Excel</Button>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} id="export-pdf-btn" onClick={() => handleExport('PDF')}>PDF</Button>
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, border: '1px solid #E0E7EF' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #E0E7EF', px: 2 }}>
          <Tab label="Technician Performance" id="tab-tech" />
          <Tab label="Customer Report" id="tab-cust" />
          <Tab label="Inventory Report" id="tab-inv" />
          <Tab label="SLA Report" id="tab-sla" />
        </Tabs>

        {/* Technician Performance Tab */}
        <TabPanel value={tab} index={0}>
          {techLoading ? <LoadingSpinner /> : techErr ? <ErrorState message={techErr} onRetry={loadTech} /> : (
            <Box px={2} pb={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Technician</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Assigned</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Avg Response</TableCell>
                      <TableCell>Avg Resolution</TableCell>
                      <TableCell>Hours Worked</TableCell>
                      <TableCell>SLA Compliance</TableCell>
                      <TableCell>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(techReport || []).length === 0 ? (
                      <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                          <EngineeringIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                          <Typography>No technician data available.</Typography>
                        </Box>
                      </TableCell></TableRow>
                    ) : (techReport || []).map((t) => (
                      <TableRow key={t.technicianId} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{t.technicianName}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{t.technicianEmail}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{t.jobsAssigned}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600} color="success.main">{t.jobsCompleted}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{formatHours(t.avgResponseTimeHours)}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{formatHours(t.avgResolutionTimeHours)}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{formatHours(t.totalHoursWorked)}</Typography></TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress variant="determinate" value={t.slaCompliancePercentage || 0}
                              sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#E0E7EF' }} />
                            <Typography variant="caption" fontWeight={600}>{formatPercent(t.slaCompliancePercentage)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${(t.productivityScore || 0).toFixed(0)}`} size="small"
                            color={t.productivityScore >= 70 ? 'success' : t.productivityScore >= 40 ? 'warning' : 'error'}
                            sx={{ fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </TabPanel>

        {/* Customer Report Tab */}
        <TabPanel value={tab} index={1}>
          {custLoading ? <LoadingSpinner /> : custErr ? <ErrorState message={custErr} onRetry={loadCust} /> : (
            <Box px={2} pb={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Active Sites</TableCell>
                      <TableCell>Total Orders</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>SLA Compliance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(custReport || []).length === 0 ? (
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                          <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                          <Typography>No customer data.</Typography>
                        </Box>
                      </TableCell></TableRow>
                    ) : (custReport || []).map((c) => (
                      <TableRow key={c.customerId} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{c.customerName}</Typography></TableCell>
                        <TableCell><Chip label={c.customerCode} size="small" sx={{ fontFamily: 'monospace' }} /></TableCell>
                        <TableCell>{c.companyName || '—'}</TableCell>
                        <TableCell>{c.activeSitesCount}</TableCell>
                        <TableCell>{c.totalWorkOrdersCount}</TableCell>
                        <TableCell><Typography color="success.main" fontWeight={600}>{c.completedWorkOrdersCount}</Typography></TableCell>
                        <TableCell><Typography color="warning.main" fontWeight={600}>{c.pendingWorkOrdersCount}</Typography></TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress variant="determinate" value={c.slaCompliancePercentage || 0}
                              sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#E0E7EF' }} />
                            <Typography variant="caption" fontWeight={600}>{formatPercent(c.slaCompliancePercentage)}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </TabPanel>

        {/* Inventory Report Tab */}
        <TabPanel value={tab} index={2}>
          {invLoading ? <LoadingSpinner /> : invErr ? <ErrorState message={invErr} onRetry={loadInv} /> : (
            <Box px={2} pb={2}>
              {invReport && (
                <Grid container spacing={2.5} mb={3}>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Total Parts" value={invReport.totalCatalogParts} icon={<InventoryIcon />} color="#1565C0" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Low Stock" value={invReport.lowStockPartsCount} icon={<InventoryIcon />} color="#C62828" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Inventory Value" value={formatCurrency(invReport.totalInventoryValue)} icon={<InventoryIcon />} color="#2E7D32" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Total Usage" value={invReport.totalPartsUsedCount} icon={<InventoryIcon />} color="#F57F17"
                      subtitle={`Most used: ${invReport.mostUsedPartName || '—'}`} />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </TabPanel>

        {/* SLA Report Tab */}
        <TabPanel value={tab} index={3}>
          {slaLoading ? <LoadingSpinner /> : slaErr ? <ErrorState message={slaErr} onRetry={loadSLA} /> : (
            <Box px={2} pb={2}>
              {slaReport && (
                <Grid container spacing={2.5} mb={3}>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Total SLAs" value={slaReport.totalSLAHistories} icon={<VerifiedIcon />} color="#1565C0" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="SLA Compliance" value={formatPercent(slaReport.overallSLACompliancePercentage)} icon={<VerifiedIcon />} color="#2E7D32" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Response Breaches" value={slaReport.responseBreachedCount} icon={<VerifiedIcon />} color="#C62828" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Resolution Breaches" value={slaReport.resolutionBreachedCount} icon={<VerifiedIcon />} color="#E65100" />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </TabPanel>
      </Paper>

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default ReportsPage;
