// Основні типи для фронтенду Client Feedback Hub

// Користувач системи
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ролі користувачів
export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

// Проєкт для збору фідбеків
export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  isActive: boolean;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    feedbacks: number;
  };
}

// Фідбек від клієнта
export interface Feedback {
  id: string;
  title: string;
  description: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  projectId: string;
  project?: Project;
  authorId?: string;
  author?: User;
  authorEmail?: string;
  authorName?: string;
  coordinates?: FeedbackCoordinates;
  selector?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Рівні критичності фідбеку
export enum FeedbackSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Статуси фідбеку
export enum FeedbackStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Координати для pin tool
export interface FeedbackCoordinates {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

// Форми автентифікації
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterApiData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Форми створення/редагування проєктів
export interface ProjectForm {
  name: string;
  description: string;
  url?: string;
}

// Форми створення/редагування фідбеків
export interface FeedbackForm {
  title: string;
  description: string;
  severity: FeedbackSeverity;
  projectId: string;
  authorEmail?: string;
  authorName?: string;
  coordinates?: FeedbackCoordinates;
  selector?: string;
}

// Форма оновлення фідбеку (для менеджерів)
export interface FeedbackUpdateForm {
  title?: string;
  description?: string;
  severity?: FeedbackSeverity;
  status?: FeedbackStatus;
  coordinates?: FeedbackCoordinates;
  selector?: string;
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

// Фільтри для фідбеків
export interface FeedbackFilters {
  projectId?: string;
  status?: FeedbackStatus;
  severity?: FeedbackSeverity;
  authorEmail?: string;
  search?: string;
}

// Стан автентифікації
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

// Навігаційні елементи
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  requiredRole?: UserRole[];
}

// Статистика для дашборду
export interface DashboardStats {
  totalProjects: number;
  totalFeedbacks: number;
  openFeedbacks: number;
  resolvedFeedbacks: number;
  criticalFeedbacks: number;
  recentFeedbacks: Feedback[];
}

// Параметри Pin Tool
export interface PinToolConfig {
  isActive: boolean;
  currentPin?: {
    x: number;
    y: number;
    feedback?: Partial<Feedback>;
  };
}

// Налаштування користувача
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'uk' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    newFeedback: boolean;
    statusUpdates: boolean;
  };
}

// Системні налаштування (тільки для адміністраторів)
export interface SystemSettings {
  allowRegistration: boolean;
  defaultUserRole: UserRole;
  maxFileSize: number;
  allowedFileTypes: string[];
  rateLimits: {
    general: number;
    auth: number;
    upload: number;
  };
}

// Помилки форм
export type FormErrors<T> = {
  [K in keyof T]?: string;
} & {
  _form?: string;
};

// Статуси завантаження
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Типи для React Hook Form
export type FormMode = 'create' | 'edit' | 'view';

// Опції селектів
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Конфігурація теми
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  radius: string;
}