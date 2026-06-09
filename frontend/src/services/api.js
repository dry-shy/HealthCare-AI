import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Health Check API
export const healthCheckAPI = {
    analyze: (formData) => api.post('/health-check/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/health-check', { params }),
    getOne: (id) => api.get(`/health-check/${id}`),
    getStats: () => api.get('/health-check/stats'),
    archive: (id) => api.delete(`/health-check/${id}`)
};

// Symptoms API
export const symptomsAPI = {
    create: (data) => api.post('/symptoms', data),
    getAll: (params) => api.get('/symptoms', { params }),
    getOne: (id) => api.get(`/symptoms/${id}`),
    getTimeline: (days) => api.get('/symptoms/timeline', { params: { days } }),
    getList: () => api.get('/symptoms/list'),
    archive: (id) => api.delete(`/symptoms/${id}`)
};

// Remedies API
export const remediesAPI = {
    getAll: (params) => api.get('/remedies', { params }),
    getOne: (id) => api.get(`/remedies/${id}`),
    getByCondition: (condition) => api.get(`/remedies/condition/${condition}`),
    getCategories: () => api.get('/remedies/categories'),
    getAI: (data) => api.post('/remedies/ai', data),
    rate: (id, rating) => api.post(`/remedies/${id}/rate`, { rating })
};

// Medicine API
export const medicineAPI = {
    getAdvice: (data) => api.post('/medicine/advice', data),
    chat: (data) => api.post('/medicine/chat', data),
    getOTC: () => api.get('/medicine/otc'),
    getTelemedicine: () => api.get('/medicine/telemedicine')
};

// Hospitals API
export const hospitalsAPI = {
    getNearby: (params) => api.get('/hospitals/nearby', { params }),
    getDetails: (id) => api.get(`/hospitals/${id}`),
    getEmergency: () => api.get('/hospitals/emergency'),
    getSpecialists: (specialty) => api.get('/hospitals/specialists', { params: { specialty } })
};

// Dashboard API
export const dashboardAPI = {
    getOverview: () => api.get('/dashboard'),
    getHistory: (params) => api.get('/dashboard/history', { params }),
    getInsights: () => api.get('/dashboard/insights'),
    exportData: () => api.get('/dashboard/export'),
    deleteData: () => api.delete('/dashboard/data')
};

export default api;
