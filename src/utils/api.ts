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
	uploadPdf: (id: number, fileBase64: string) => api.post(`/bons-reception/${id}/upload-pdf`, { fileBase64 }),
};

export const bonsSortieApi = {
	list: () => api.get('/bons-sortie'),
	get: (id: number) => api.get(`/bons-sortie/${id}`),
	create: (data: any) => api.post('/bons-sortie', data),
	update: (id: number, data: any) => api.put(`/bons-sortie/${id}`, data),
	remove: (id: number) => api.delete(`/bons-sortie/${id}`),
	saveLignes: (id: number, lignes: any[]) => api.post(`/bons-sortie/${id}/lignes`, { lignes }),
	uploadPdf: (id: number, fileBase64: string) => api.post(`/bons-sortie/${id}/upload-pdf`, { fileBase64 }),
};



export const stockApi = {
  listMovements: () => api.get('/stock/mouvements'),
};





export const pvReceptionApi = {
  list: (params?: any) => api.get('/pv-reception', { params }),
  get: (id: number) => api.get(`/pv-reception/${id}`),
  create: (data: any) => api.post('/pv-reception', data),
  update: (id: number, data: any) => api.put(`/pv-reception/${id}`, data),
  remove: (id: number) => api.delete(`/pv-reception/${id}`),
  finalize: (id: number) => api.put(`/pv-reception/${id}/finalize`),
  stats: () => api.get('/pv-reception/stats'),
  getBonsReception: () => api.get('/pv-reception/bons-reception'),
};

export const userManagementApi = {
  // Utilisateurs
  listUsers: (params?: any) => api.get('/user-management/users', { params }),
  getUser: (id: number) => api.get(`/user-management/users/${id}`),
  createUser: (data: any) => api.post('/user-management/users', data),
  updateUser: (id: number, data: any) => api.put(`/user-management/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/user-management/users/${id}`),
  changePassword: (id: number, data: any) => api.put(`/user-management/users/${id}/password`, data),
  deactivateUser: (id: number) => api.put(`/user-management/users/${id}/deactivate`),
  activateUser: (id: number) => api.put(`/user-management/users/${id}/activate`),
  getUserStats: () => api.get('/user-management/users/stats'),
  checkPermissions: (id: number, permission: string) => api.get(`/user-management/users/${id}/permissions?permission=${permission}`),

  // Rôles
  listRoles: () => api.get('/user-management/roles'),

  // Profil personnel
  getProfile: () => api.get('/user-management/profile'),
  updateProfile: (data: any) => api.put('/user-management/profile', data),
  changeProfilePassword: (data: any) => api.put('/user-management/profile/password', data),
};


