import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Project,
  Feedback,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  ProjectForm,
  FeedbackForm,
  FeedbackUpdateForm,
  FeedbackFilters,
  PaginationParams,
} from '@/types';

// API client setup
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // for cookies support
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обробки відповідей та автоматичного оновлення токенів
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Якщо отримали 401 і це не повторний запит
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Спробуємо оновити токен
        const response = await apiClient.post('/auth/refresh');
        const { accessToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Не вдалося оновити токен, перенаправляємо на логін
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API для автентифікації
export const authApi = {
  login: (data: LoginForm): Promise<AxiosResponse<ApiResponse<{ user: User; accessToken: string }>>> =>
    apiClient.post('/auth/login', data),
  
  register: (data: RegisterForm): Promise<AxiosResponse<ApiResponse<{ user: User; accessToken: string }>>> =>
    apiClient.post('/auth/register', data),
  
  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.post('/auth/logout'),
  
  refreshToken: (): Promise<AxiosResponse<ApiResponse<{ accessToken: string }>>> =>
    apiClient.post('/auth/refresh'),
  
  getCurrentUser: (): Promise<User> =>
    apiClient.get('/auth/me').then(response => response.data.data.user),
};

// API для користувачів
export const usersApi = {
  getUsers: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<User>>>> =>
    apiClient.get('/users', { params }),
  
  getUser: (id: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    apiClient.get(`/users/${id}`),
  
  updateUser: (id: string, data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    apiClient.put(`/users/${id}`, data),
  
  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.delete(`/users/${id}`),
  
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    apiClient.put('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.put('/users/change-password', data),
};

// API для проєктів
export const projectsApi = {
  getProjects: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Project>>>> =>
    apiClient.get('/projects', { params }),
  
  getProject: (id: string): Promise<AxiosResponse<ApiResponse<Project>>> =>
    apiClient.get(`/projects/${id}`),
  
  createProject: (data: ProjectForm): Promise<AxiosResponse<ApiResponse<Project>>> =>
    apiClient.post('/projects', data),
  
  updateProject: (id: string, data: Partial<ProjectForm>): Promise<AxiosResponse<ApiResponse<Project>>> =>
    apiClient.put(`/projects/${id}`, data),
  
  deleteProject: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.delete(`/projects/${id}`),
  
  getProjectStats: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    apiClient.get(`/projects/${id}/stats`),
};

// API для фідбеків
export const feedbacksApi = {
  getFeedbacks: (
    filters?: FeedbackFilters & PaginationParams
  ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Feedback>>>> =>
    apiClient.get('/feedbacks', { params: filters }),
  
  getFeedback: (id: string): Promise<AxiosResponse<ApiResponse<Feedback>>> =>
    apiClient.get(`/feedbacks/${id}`),
  
  createFeedback: (data: FeedbackForm): Promise<AxiosResponse<ApiResponse<Feedback>>> =>
    apiClient.post('/feedbacks', data),
  
  updateFeedback: (id: string, data: FeedbackUpdateForm): Promise<AxiosResponse<ApiResponse<Feedback>>> =>
    apiClient.put(`/feedbacks/${id}`, data),
  
  deleteFeedback: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.delete(`/feedbacks/${id}`),
  
  uploadAttachment: (feedbackId: string, file: File): Promise<AxiosResponse<ApiResponse<{ filename: string }>>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/feedbacks/${feedbackId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteAttachment: (feedbackId: string, filename: string): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.delete(`/feedbacks/${feedbackId}/attachments/${filename}`),
};

// API для адміністрування
export const adminApi = {
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    apiClient.get('/admin/dashboard'),
  
  getAllUsers: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<User>>>> =>
    apiClient.get('/admin/users', { params }),
  
  toggleUserStatus: (id: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    apiClient.put(`/admin/users/${id}/toggle-status`),
  
  updateUserRole: (id: string, role: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    apiClient.put(`/admin/users/${id}/role`, { role }),
  
  getSystemSettings: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    apiClient.get('/admin/settings'),
  
  updateSystemSettings: (data: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    apiClient.put('/admin/settings', data),
  
  getSystemLogs: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<any>>> =>
    apiClient.get('/admin/logs', { params }),
};

// Експорт основного клієнта для кастомних запитів
export default apiClient;