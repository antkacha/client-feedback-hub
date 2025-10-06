import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, LoginForm, RegisterApiData } from '../types';

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Сервіс автентифікації з axios wrapper для auth endpoints
 * Забезпечує централізовану логіку роботи з токенами та користувачем
 */
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

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private removeStoredToken(): void {
    localStorage.removeItem('accessToken');
  }

  private clearAuth(): void {
    this.removeStoredToken();
  }

  /**
   * Вхід користувача в систему
   * @param credentials - email та пароль
   * @returns Promise з користувачем та токеном
   */
  async login(credentials: LoginForm): Promise<{ user: User; accessToken: string }> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { user, accessToken } = response.data.data || response.data;

      // Зберігаємо access token в localStorage
      // TODO: В продакшені краще використовувати secure memory storage
      localStorage.setItem('accessToken', accessToken);

      // TODO: Тут бекенд автоматично встановить httpOnly cookie з refresh токеном
      // Це робиться на серверній стороні через Set-Cookie header
      
      return { user, accessToken };
    } catch (error) {
      // Логування помилки для debugging
      console.error('AuthService.login error:', error);
      throw error;
    }
  }

  /**
   * Реєстрація нового користувача
   * @param userData - дані нового користувача
   * @returns Promise з користувачем та токеном
   */
  async register(userData: RegisterApiData): Promise<{ user: User; accessToken: string }> {
    try {
      const response = await this.api.post('/auth/register', userData);
      const { user, accessToken } = response.data.data || response.data;

      // Зберігаємо access token в localStorage
      localStorage.setItem('accessToken', accessToken);

      // TODO: Тут бекенд автоматично встановить httpOnly cookie з refresh токеном
      
      return { user, accessToken };
    } catch (error) {
      console.error('AuthService.register error:', error);
      throw error;
    }
  }

  /**
   * Вихід користувача з системи
   * Очищає токени та викликає API для інвалідації сесії
   */
  async logout(): Promise<void> {
    try {
      // Викликаємо API для очищення refresh token на сервері
      await this.api.post('/auth/logout');
    } catch (error) {
      // Навіть якщо API повернув помилку, продовжуємо logout
      console.error('AuthService.logout API error:', error);
    } finally {
      // Очищаємо локальний access token
      localStorage.removeItem('accessToken');
      
      // TODO: Тут також очиститься httpOnly cookie автоматично (сервер встановить його з expired date)
    }
  }

  /**
   * Оновлення access token за допомогою refresh token
   * @returns Promise з новим access token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await this.api.post('/auth/refresh');
      const { accessToken } = response.data.data || response.data;

      // Оновлюємо access token в localStorage
      localStorage.setItem('accessToken', accessToken);

      return accessToken;
    } catch (error) {
      // Якщо не вдалося оновити токен - очищаємо localStorage
      localStorage.removeItem('accessToken');
      console.error('AuthService.refreshToken error:', error);
      throw error;
    }
  }

  /**
   * Отримання поточного користувача
   * @returns Promise з даними користувача
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.get('/auth/me');
      return response.data.data || response.data;
    } catch (error) {
      console.error('AuthService.getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Перевірка чи користувач автентифікований
   * @returns boolean - чи є валідний access token
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return false;
    }

    // TODO: Додати перевірку валідності токена (expiration time)
    // Можна декодувати JWT і перевірити exp поле
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return tokenPayload.exp > currentTime;
    } catch {
      // Якщо токен невалідний - видаляємо його
      localStorage.removeItem('accessToken');
      return false;
    }
  }

  /**
   * Отримання access token з localStorage
   * @returns string | null - access token або null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Очищення всіх токенів (без виклику API)
   * Використовується у випадках коли потрібно швидко очистити стан
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    // TODO: httpOnly cookie очиститься автоматично при expire або через API
  }

  /**
   * Перевірка чи потрібно оновити токен
   * @returns boolean - чи потрібно оновлювати токен
   */
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpire = tokenPayload.exp - currentTime;
      
      // Оновлюємо токен якщо до закінчення менше 5 хвилин
      return timeUntilExpire < 300; // 5 minutes
    } catch {
      return false;
    }
  }
}

// Експортуємо singleton екземпляр для використання в додатку
export const authService = new AuthService();