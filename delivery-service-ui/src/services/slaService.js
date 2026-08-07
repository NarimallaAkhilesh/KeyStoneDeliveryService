import apiClient from '@/api/apiClient';

const BASE_SLA    = '/api/sla';
const BASE_NOTIFY = '/api/notifications';

const slaService = {
  // ─── SLA Config ───────────────────────────────────────────────────────────
  getAllConfigs:    ()     => apiClient.get(BASE_SLA),
  createConfig:    (data) => apiClient.post(BASE_SLA, data),
  updateConfig:    (id, data) => apiClient.put(`${BASE_SLA}/${id}`, data),

  // ─── SLA Status ───────────────────────────────────────────────────────────
  getByWorkOrder:  (id)   => apiClient.get(`${BASE_SLA}/workorders/${id}`),
  getBreaches:     ()     => apiClient.get(`${BASE_SLA}/breaches`),
  getUpcoming:     ()     => apiClient.get(`${BASE_SLA}/upcoming`),
  getDashboard:    ()     => apiClient.get(`${BASE_SLA}/dashboard`),

  // ─── Notifications ────────────────────────────────────────────────────────
  getEmailLogs:    ()     => apiClient.get(`${BASE_NOTIFY}/emailLogs`),
  sendTestEmail:   (data) => apiClient.post(`${BASE_NOTIFY}/test`, data),
};

export default slaService;
