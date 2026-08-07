import apiClient from '@/api/apiClient';

// All endpoints map exactly to the Spring Boot controllers:
// PartController      → /api/parts
// TimeLogController   → /api/workorders/{id}/timer/*  and  /api/technicians/{id}/timelogs

const BASE_PARTS = '/api/parts';
const BASE_WO    = '/api/workorders';
const BASE_TECH  = '/api/technicians';

const inventoryService = {
  // ─── Parts Catalog ────────────────────────────────────────────────────────
  // GET  /api/parts
  getAllParts:      ()           => apiClient.get(BASE_PARTS),
  // GET  /api/parts/{id}
  getPartById:      (id)         => apiClient.get(`${BASE_PARTS}/${id}`),
  // POST /api/parts
  createPart:       (data)       => apiClient.post(BASE_PARTS, data),
  // PUT  /api/parts/{id}
  updatePart:       (id, data)   => apiClient.put(`${BASE_PARTS}/${id}`, data),
  // DELETE /api/parts/{id}
  deletePart:       (id)         => apiClient.delete(`${BASE_PARTS}/${id}`),
  // PUT  /api/parts/activate/{id}
  activatePart:     (id)         => apiClient.put(`${BASE_PARTS}/activate/${id}`),
  // PUT  /api/parts/deactivate/{id}
  deactivatePart:   (id)         => apiClient.put(`${BASE_PARTS}/deactivate/${id}`),
  // PUT  /api/parts/restore/{id}
  restorePart:      (id)         => apiClient.put(`${BASE_PARTS}/restore/${id}`),
  // PUT  /api/parts/{id}/stock
  updateStock:      (id, data)   => apiClient.put(`${BASE_PARTS}/${id}/stock`, data),
  // GET  /api/parts/low-stock
  getLowStockParts: ()           => apiClient.get(`${BASE_PARTS}/low-stock`),

  // ─── Work Order Parts Usage ───────────────────────────────────────────────
  // POST /api/workorders/{id}/parts  Body: PartUsageRequestDTO
  addPartToWorkOrder:    (workOrderId, data) => apiClient.post(`${BASE_WO}/${workOrderId}/parts`, data),
  // GET  /api/workorders/{id}/parts
  getWorkOrderParts:     (workOrderId)       => apiClient.get(`${BASE_WO}/${workOrderId}/parts`),
  // DELETE /api/workorders/{id}/parts/{usageId}
  removePartFromWorkOrder: (workOrderId, usageId) =>
    apiClient.delete(`${BASE_WO}/${workOrderId}/parts/${usageId}`),

  // ─── Time Logs ────────────────────────────────────────────────────────────
  // POST /api/workorders/{id}/timer/start
  startTimer:   (workOrderId, data) => apiClient.post(`${BASE_WO}/${workOrderId}/timer/start`, data || {}),
  // PUT  /api/workorders/{id}/timer/pause
  pauseTimer:   (workOrderId, data) => apiClient.put(`${BASE_WO}/${workOrderId}/timer/pause`, data || {}),
  // PUT  /api/workorders/{id}/timer/resume
  resumeTimer:  (workOrderId, data) => apiClient.put(`${BASE_WO}/${workOrderId}/timer/resume`, data || {}),
  // PUT  /api/workorders/{id}/timer/stop
  stopTimer:    (workOrderId, data) => apiClient.put(`${BASE_WO}/${workOrderId}/timer/stop`, data || {}),
  // GET  /api/workorders/{id}/timelogs
  getByWorkOrder: (workOrderId)     => apiClient.get(`${BASE_WO}/${workOrderId}/timelogs`),
  // GET  /api/technicians/{id}/timelogs
  getByTechnician: (technicianId)   => apiClient.get(`${BASE_TECH}/${technicianId}/timelogs`),
};

export default inventoryService;
