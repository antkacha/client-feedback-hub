import { Request } from 'express';

// Користувач системи
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ролі користувачів (як строки)
export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

// Проєкт для збору фідбеків
export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Фідбек від клієнта
export interface Feedback {
  id: string;
  title: string;
  description: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  projectId: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  coordinates?: FeedbackCoordinates;
  selector?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Рівні критичності фідбеку (як строки)
export type FeedbackSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Статуси фідбеку (як строки)
export type FeedbackStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// Координати для pin tool
export interface FeedbackCoordinates {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

// Розширений Request з автентифікованим користувачем
export interface AuthenticatedRequest extends Request {
  user?: any; // Prisma User type
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Відповіді API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Пагінація
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// DTO для створення користувача
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// DTO для логіну
export interface LoginDto {
  email: string;
  password: string;
}

// DTO для створення проєкту
export interface CreateProjectDto {
  name: string;
  description: string;
  url?: string;
}

// DTO для оновлення проєкту
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  url?: string;
  isActive?: boolean;
}

// DTO для створення фідбеку
export interface CreateFeedbackDto {
  title: string;
  description: string;
  severity: FeedbackSeverity;
  projectId: string;
  authorEmail?: string;
  authorName?: string;
  coordinates?: FeedbackCoordinates;
  selector?: string;
}

// DTO для оновлення фідбеку
export interface UpdateFeedbackDto {
  title?: string;
  description?: string;
  severity?: FeedbackSeverity;
  status?: FeedbackStatus;
  coordinates?: FeedbackCoordinates;
  selector?: string;
}