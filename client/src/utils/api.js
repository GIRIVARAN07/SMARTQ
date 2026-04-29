import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('smartq_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartq_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

// Tokens API
export const tokensAPI = {
  book: (data) => api.post('/tokens/book', data),
  getMyTokens: (params) => api.get('/tokens/my-tokens', { params }),
  getQueue: (serviceId) => api.get(`/tokens/queue/${serviceId}`),
  cancel: (id) => api.put(`/tokens/${id}/cancel`),
  getHistory: (params) => api.get('/tokens/history', { params })
};

// Admin API
export const adminAPI = {
  callNext: (serviceId) => api.put(`/admin/call-next/${serviceId}`),
  complete: (tokenId) => api.put(`/admin/complete/${tokenId}`),
  noShow: (tokenId) => api.put(`/admin/no-show/${tokenId}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getQueue: (serviceId) => api.get(`/admin/queue/${serviceId}`),
  getUsers: () => api.get('/admin/users')
};

export default api;
