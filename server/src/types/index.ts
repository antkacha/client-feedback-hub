/**
 * Загальні TypeScript типи для API
 * Опи// JWT Payload структура
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Alias для сумісності
export interface JWTPayload extends JwtPayload {}

// Refresh Token Payload
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}ля роботи з аутентифікацією, запитами та відповідями
 */

import { Request } from 'express';
import { User } from '@prisma/client';

// Розширення Express Request для включення даних користувача
export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
  params: any;
  cookies?: any;
  query: any;
  body: any;
}

// Стандартна структура API відповіді
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Параметри пагінації для списків
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Параметри фільтрації
export interface FilterParams {
  search?: string;
  status?: string[];
  createdFrom?: Date;
  createdTo?: Date;
}

// JWT Payload структура
export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

// Refresh Token Payload
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Дані для реєстрації користувача
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Дані для входу користувача
export interface LoginData {
  email: string;
  password: string;
}

// Результат аутентифікації
export interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// Дані для створення проекту
export interface CreateProjectData {
  name: string;
  description?: string;
  websiteUrl?: string;
  settings?: Record<string, any>;
}

// Дані для оновлення проекту
export interface UpdateProjectData {
  name?: string;
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

// Дані для створення відгуку
export interface CreateFeedbackData {
  title: string;
  description: string;
  priority?: string;
  severity?: string;
  type?: string;
  category?: string;
  position?: Record<string, any>;
  metadata?: Record<string, any>;
  pinData?: Record<string, any>;
  browserInfo?: Record<string, any>;
  assigneeId?: string;
}

// Дані для оновлення відгуку
export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  severity?: string;
  type?: string;
  category?: string;
  position?: Record<string, any>;
  metadata?: Record<string, any>;
  assigneeId?: string;
}

// Налаштування середовища
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: number;
  CORS_ORIGIN: string[];
  UPLOAD_MAX_FILE_SIZE: number;
  UPLOAD_ALLOWED_TYPES: string[];
}

// Конфігурація логування
export interface LoggerConfig {
  level: string;
  format: string;
  transports: any[];
}

// Метадані файлу для завантаження
export interface FileUpload {
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
}

// Результат операції з файлом
export interface FileOperationResult {
  success: boolean;
  file?: FileUpload;
  error?: string;
}

// Статистика проекту
export interface ProjectStats {
  totalFeedbacks: number;
  openFeedbacks: number;
  resolvedFeedbacks: number;
  averageResolutionTime?: number;
  feedbacksByStatus: Record<string, number>;
  feedbacksByPriority: Record<string, number>;
  feedbacksByType: Record<string, number>;
}

// Параметри пошуку
export interface SearchParams extends PaginationParams, FilterParams {
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
}