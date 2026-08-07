import apiClient from '@/api/apiClient';

const BASE_DASH   = '/api/dashboard';
const BASE_REPORT = '/api/reports';

const dashboardService = {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  getSummary:    () => apiClient.get(`${BASE_DASH}/summary`),
  getStatistics: () => apiClient.get(`${BASE_DASH}/statistics`),

  // ─── Reports ──────────────────────────────────────────────────────────────
  getTechnicianReport: (params) => apiClient.get(`${BASE_REPORT}/technicians`, { params }),
  getCustomerReport:   (params) => apiClient.get(`${BASE_REPORT}/customers`, { params }),
  getInventoryReport:  ()       => apiClient.get(`${BASE_REPORT}/inventory`),
  getSLAReport:        (params) => apiClient.get(`${BASE_REPORT}/sla`, { params }),

  // ─── Exports ──────────────────────────────────────────────────────────────
  exportCSV:   (data) => apiClient.post(`${BASE_REPORT}/export/csv`,   data, { responseType: 'blob' }),
  exportExcel: (data) => apiClient.post(`${BASE_REPORT}/export/excel`, data, { responseType: 'blob' }),
  exportPDF:   (data) => apiClient.post(`${BASE_REPORT}/export/pdf`,   data, { responseType: 'blob' }),
};

export default dashboardService;
