import apiClient from '@/api/apiClient';

// All endpoints map exactly to the Spring Boot controllers:
// TechnicianAssignmentController  → POST /api/workorders/{id}/assign
//                                   PUT  /api/workorders/{id}/reassign
//                                   DELETE /api/workorders/{id}/assignment
//                                   GET  /api/workorders/{id}/assignment
// WorkOrderTrackingController     → PUT  /api/workorders/{id}/status
//                                   GET  /api/workorders/{id}/history
//                                   GET  /api/workorders/{id}/timeline
//                                   GET  /api/workorders/search/advanced
// TechnicianController            → GET  /api/technicians/{id}/workorders
//                                   GET  /api/technicians/{id}/dashboard

const BASE = '/api/workorders';
const BASE_TECH = '/api/technicians';

const trackingService = {
  // ─── Technician Assignment ────────────────────────────────────────────────
  // POST /api/workorders/{id}/assign  Body: { technicianId }
  assignTechnician: (workOrderId, data) =>
    apiClient.post(`${BASE}/${workOrderId}/assign`, data),

  // PUT /api/workorders/{id}/reassign  Body: { technicianId }
  reassign: (workOrderId, data) =>
    apiClient.put(`${BASE}/${workOrderId}/reassign`, data),

  // DELETE /api/workorders/{id}/assignment
  removeAssignment: (workOrderId) =>
    apiClient.delete(`${BASE}/${workOrderId}/assignment`),

  // GET /api/workorders/{id}/assignment
  getAssignment: (workOrderId) =>
    apiClient.get(`${BASE}/${workOrderId}/assignment`),

  // ─── Technician Dashboard ─────────────────────────────────────────────────
  // GET /api/technicians/{id}/workorders?filter=
  getTechnicianWorkOrders: (techId, filter) =>
    apiClient.get(`${BASE_TECH}/${techId}/workorders`, { params: filter ? { filter } : {} }),

  // GET /api/technicians/{id}/dashboard
  getTechnicianDash: (techId) =>
    apiClient.get(`${BASE_TECH}/${techId}/dashboard`),

  // ─── Work Order Status Tracking ──────────────────────────────────────────
  // PUT /api/workorders/{id}/status  Body: { newStatus, remarks }
  updateStatus: (id, data) =>
    apiClient.put(`${BASE}/${id}/status`, data),

  // GET /api/workorders/{id}/history
  getStatusHistory: (id) =>
    apiClient.get(`${BASE}/${id}/history`),

  // GET /api/workorders/{id}/timeline
  getTimeline: (id) =>
    apiClient.get(`${BASE}/${id}/timeline`),

  // GET /api/workorders/search/advanced
  searchAdvanced: (params) =>
    apiClient.get(`${BASE}/search/advanced`, { params }),
};

export default trackingService;
