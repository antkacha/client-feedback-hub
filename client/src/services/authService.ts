/**
 * Сервіс для роботи з автентифікацією
 * Axios wrapper для auth endpoints з управлінням токенами
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginData, 
  RegisterData, 
  ApiResponse 
} from '../types';

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: {
    code: number;
    message: string;
  };
}

class AuthService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      withCredentials: true, // Важливо для cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для автоматичного додавання токену
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor для обробки помилок автентифікації
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Якщо отримали 401 і це не повторний запит
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Спробуємо оновити токен
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Якщо не вдалося оновити токен - перенаправляємо на логін
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Отримання токену з localStorage
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Збереження токену в localStorage
   */
  private setStoredToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Видалення токену з localStorage
   */
  private removeStoredToken(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Реєстрація нового користувача
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', data);
      
      // Витягуємо токен з відповіді (якщо повертається)
      const accessToken = response.data.data?.accessToken;
      if (accessToken) {
        this.setStoredToken(accessToken);
      }

      return {
        success: true,
        user: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Помилка реєстрації';
      return {
        success: false,
        error: {
          code: error.response?.status || 500,
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Вхід користувача
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/login', data);
      
      // Витягуємо токен з відповіді (якщо повертається)
      const accessToken = response.data.data?.accessToken;
      if (accessToken) {
        this.setStoredToken(accessToken);
      }

      return {
        success: true,
        user: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Помилка входу';
      return {
        success: false,
        error: {
          code: error.response?.status || 500,
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Вихід користувача
   */
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ігноруємо помилки при logout
      console.warn('Помилка при logout:', error);
    } finally {
      // Завжди очищуємо локальний токен
      this.removeStoredToken();
    }
  }

  /**
   * Оновлення access token за допомогою refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response: AxiosResponse<ApiResponse<{ accessToken: string }>> = 
        await this.api.post('/auth/refresh');
      
      const newToken = response.data.data?.accessToken;
      if (newToken) {
        this.setStoredToken(newToken);
        return newToken;
      }
      
      return null;
    } catch (error) {
      this.removeStoredToken();
      return null;
    }
  }

  /**
   * Отримання інформації про поточного користувача
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Перевірка чи користувач автентифікований
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Отримання поточного токену
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Ручне встановлення токену (для тестування)
   */
  setToken(token: string): void {
    this.setStoredToken(token);
  }
}

// Експортуємо singleton instance
export const authService = new AuthService();
export default authService;