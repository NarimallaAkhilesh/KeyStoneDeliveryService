import apiClient from '@/api/apiClient';

const BASE = '/api/workorders';

const workOrderService = {
  // ─── CRUD ─────────────────────────────────────────────────────────────────────
  getAll:   ()          => apiClient.get(BASE),
  getById:  (id)        => apiClient.get(`${BASE}/${id}`),
  create:   (data)      => apiClient.post(BASE, data),
  update:   (id, data)  => apiClient.put(`${BASE}/${id}`, data),
  delete:   (id)        => apiClient.delete(`${BASE}/${id}`),
  activate: (id)        => apiClient.put(`${BASE}/activate/${id}`),
  restore:  (id)        => apiClient.put(`${BASE}/restore/${id}`),

  // ─── Customer-specific lists ──────────────────────────────────────────────────
  getCustomerWorkOrders: (customerId) => apiClient.get(`${BASE}/customer/${customerId}`),
  getTechnicianWorkOrders: (techId)   => apiClient.get(`${BASE}/technician/${techId}`),

  // ─── Filtering ────────────────────────────────────────────────────────────────
  getByStatus:   (status)   => apiClient.get(`${BASE}/status/${status}`),
  getByPriority: (priority) => apiClient.get(`${BASE}/priority/${priority}`),
  search:        (title)    => apiClient.get(`${BASE}/search`, { params: { title } }),

  // ─── Legacy assign (WorkOrderController PUT /assign) ─────────────────────────
  // Prefer trackingService.assignTechnician for new assignment flows
  assign: (data) => apiClient.put(`${BASE}/assign`, data),

  // ─── Status transitions via WorkOrderTrackingController ──────────────────────
  // PUT /api/workorders/{id}/status   Body: { newStatus, remarks }
  updateStatus: (id, data)  => apiClient.put(`${BASE}/${id}/status`, data),

  // PUT /api/workorders/{id}/hold     Body: { holdReason, expectedResumeDate }
  hold: (id, data)          => apiClient.put(`${BASE}/${id}/hold`, data),

  // PUT /api/workorders/{id}/complete  Body: { resolutionSummary, completionRemarks }
  complete: (id, data)      => apiClient.put(`${BASE}/${id}/complete`, data),

  // PUT /api/workorders/{id}/cancel   Body: { cancellationReason }
  cancel: (id, data)        => apiClient.put(`${BASE}/${id}/cancel`, data),

  // ─── Timeline & History ───────────────────────────────────────────────────────
  getTimeline:     (id) => apiClient.get(`${BASE}/${id}/timeline`),
  getStatusHistory:(id) => apiClient.get(`${BASE}/${id}/history`),
};

export default workOrderService;
