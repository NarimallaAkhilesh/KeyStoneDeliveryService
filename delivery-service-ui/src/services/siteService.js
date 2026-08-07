import apiClient from '@/api/apiClient';

const BASE = '/api/sites';

const siteService = {
  getAll:         (status)        => apiClient.get(BASE, { params: { status } }),
  getById:        (id)            => apiClient.get(`${BASE}/${id}`),
  getByCustomer:  (customerId)    => apiClient.get(`${BASE}/customer/${customerId}`),
  create:         (data)          => apiClient.post(BASE, data),
  update:         (id, data)      => apiClient.put(`${BASE}/${id}`, data),
  delete:         (id)            => apiClient.delete(`${BASE}/${id}`),
  activate:       (id)            => apiClient.put(`${BASE}/activate/${id}`),
  deactivate:     (id)            => apiClient.put(`${BASE}/deactivate/${id}`),
  restore:        (id)            => apiClient.put(`${BASE}/restore/${id}`),
};

export default siteService;
