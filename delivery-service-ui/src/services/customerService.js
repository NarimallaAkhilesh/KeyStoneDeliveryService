import apiClient from '@/api/apiClient';

const BASE = '/api/customers';

const customerService = {
  getAll:             (status)    => apiClient.get(BASE, { params: { status } }),
  getById:            (id)        => apiClient.get(`${BASE}/${id}`),
  getCurrentCustomer: ()          => apiClient.get(`${BASE}/me`),
  create:             (data)      => apiClient.post(BASE, data),
  update:             (id, data)  => apiClient.put(`${BASE}/${id}`, data),
  delete:             (id)        => apiClient.delete(`${BASE}/${id}`),
  activate:           (id)        => apiClient.put(`${BASE}/activate/${id}`),
  deactivate:         (id)        => apiClient.put(`${BASE}/deactivate/${id}`),
  restore:            (id)        => apiClient.put(`${BASE}/restore/${id}`),
  search:             (name)      => apiClient.get(`${BASE}/search?name=${encodeURIComponent(name)}`),
};

export default customerService;
