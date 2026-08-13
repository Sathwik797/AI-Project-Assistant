import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach Authorization Bearer token automatically if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const healthApi = {
  getHealth: () => api.get('/health'),
};

export const projectsApi = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
};

export const documentsApi = {
  getDocuments: (projectId) => api.get(`/projects/${projectId}/documents`),
  getDocumentDetail: (docId) => api.get(`/documents/${docId}`),
  uploadDocument: (projectId, formData) =>
    api.post(`/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (docId) => api.delete(`/documents/${docId}`),
};

export const ragApi = {
  indexDocument: (docId) => api.post(`/documents/${docId}/index`),
  askQuestion: (projectId, data) => api.post(`/projects/${projectId}/ask`, data),
};

export const requirementsApi = {
  getRequirements: (projectId) => api.get(`/projects/${projectId}/requirements`),
  createRequirement: (projectId, data) => api.post(`/projects/${projectId}/requirements`, data),
  aiGenerate: (projectId) => api.post(`/projects/${projectId}/requirements/ai-generate`),
};

export const userStoriesApi = {
  getStories: (projectId) => api.get(`/projects/${projectId}/user-stories`),
  createStory: (projectId, data) => api.post(`/projects/${projectId}/user-stories`, data),
  aiGenerate: (projectId) => api.post(`/projects/${projectId}/user-stories/ai-generate`),
};

export const tasksApi = {
  getTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  aiGenerate: (projectId) => api.post(`/projects/${projectId}/tasks/ai-generate`),
};

export const conflictsApi = {
  getConflicts: (projectId) => api.get(`/projects/${projectId}/conflicts`),
  createConflict: (projectId, data) => api.post(`/projects/${projectId}/conflicts`, data),
  aiScan: (projectId) => api.post(`/projects/${projectId}/conflicts/ai-generate`),
};

export default api;
