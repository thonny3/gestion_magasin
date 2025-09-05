import axios from 'axios';

// Prefer environment variable if provided, otherwise default to local backend
const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
	baseURL,
});

// Attach Authorization header from localStorage token
api.interceptors.request.use((config) => {
	try {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers = config.headers || {};
			(config.headers as any).Authorization = `Bearer ${token}`;
		}
	} catch {
		// ignore
	}
	return config;
});

// Optionally handle 401 globally
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			// Token invalid/expired. Let callers handle logout if needed.
		}
		return Promise.reject(error);
	}
);

export default api;

// Convenience helpers
export const articlesApi = {
	list: () => api.get('/articles'),
	get: (id: number) => api.get(`/articles/${id}`),
	create: (data: any) => api.post('/articles', data),
	update: (id: number, data: any) => api.put(`/articles/${id}`, data),
	remove: (id: number) => api.delete(`/articles/${id}`),
};

export const categoriesApi = {
	list: () => api.get('/categories'),
	get: (id: number) => api.get(`/categories/${id}`),
	create: (data: any) => api.post('/categories', data),
	update: (id: number, data: any) => api.put(`/categories/${id}`, data),
	remove: (id: number) => api.delete(`/categories/${id}`),
};

export const bonsReceptionApi = {
	list: () => api.get('/bons-reception'),
	get: (id: number) => api.get(`/bons-reception/${id}`),
	create: (data: any) => api.post('/bons-reception', data),
	update: (id: number, data: any) => api.put(`/bons-reception/${id}`, data),
	remove: (id: number) => api.delete(`/bons-reception/${id}`),
	saveLignes: (id: number, lignes: any[]) => api.post(`/bons-reception/${id}/lignes`, { lignes }),
};

export const bonsSortieApi = {
	list: () => api.get('/bons-sortie'),
	get: (id: number) => api.get(`/bons-sortie/${id}`),
	create: (data: any) => api.post('/bons-sortie', data),
	update: (id: number, data: any) => api.put(`/bons-sortie/${id}`, data),
	remove: (id: number) => api.delete(`/bons-sortie/${id}`),
	saveLignes: (id: number, lignes: any[]) => api.post(`/bons-sortie/${id}/lignes`, { lignes }),
};

export const distributionsApi = {
	list: () => api.get('/distributions'),
	get: (id: number) => api.get(`/distributions/${id}`),
	create: (data: any) => api.post('/distributions', data),
	update: (id: number, data: any) => api.put(`/distributions/${id}`, data),
	remove: (id: number) => api.delete(`/distributions/${id}`),
  getLignes: (id: number) => api.get(`/distributions/${id}/lignes`),
  saveLignes: (id: number, lignes: any[]) => api.post(`/distributions/${id}/lignes`, { lignes }),
};

export const stockApi = {
  listMovements: () => api.get('/stock/mouvements'),
};

export const paiementsApi = {
  list: () => api.get('/paiements'),
  get: (id: number) => api.get(`/paiements/${id}`),
  create: (data: any) => api.post('/paiements', data),
  update: (id: number, data: any) => api.put(`/paiements/${id}`, data),
  remove: (id: number) => api.delete(`/paiements/${id}`),
};


