/**
 * TypeScript типи для системи Feedback
 * Описує всі інтерфейси для роботи з відгуками користувачів
 */

// Рівні важливості відгуку
export type FeedbackSeverity = 'low' | 'medium' | 'high';

// Статуси відгуку в процесі обробки
export type FeedbackStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// Тип відгуку (баг, фіча, покращення тощо)
export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'question' | 'other';

// Інформація про користувача (assignee)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Дані про pin (візуальне позиціонування на сторінці)
export interface PinData {
  x: number; // X координата на екрані
  y: number; // Y координата на екрані
  selector?: string; // CSS селектор елементу
  screenshotBlob?: Blob; // Скріншот сторінки
  screenshotUrl?: string; // URL скріншота для відображення
}

// Основна модель Feedback
export interface Feedback {
  id: string;
  title: string;
  description: string;
  shortDescription: string; // Коротка версія для карток
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  type: FeedbackType;
  projectId: string;
  assigneeId?: string;
  assignee?: User; // Розширена інформація про виконавця
  reporterId: string;
  reporter?: User; // Хто створив відгук
  pinData?: PinData; // Дані про візуальне позиціонування
  tags?: string[]; // Теги для категоризації
  attachments?: string[]; // URLs файлів
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Фільтри для списку відгуків
export interface FeedbackFilters {
  status?: FeedbackStatus[];
  severity?: FeedbackSeverity[];
  type?: FeedbackType[];
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'severity' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Дані для створення нового відгуку
export interface CreateFeedbackData {
  title: string;
  description: string;
  severity: FeedbackSeverity;
  type: FeedbackType;
  projectId: string;
  assigneeId?: string;
  pinData?: PinData;
  tags?: string[];
  attachments?: File[];
}

// Дані для оновлення відгуку
export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  severity?: FeedbackSeverity;
  status?: FeedbackStatus;
  type?: FeedbackType;
  assigneeId?: string;
  tags?: string[];
}

// Статистика відгуків для проекту
export interface FeedbackStats {
  total: number;
  byStatus: Record<FeedbackStatus, number>;
  bySeverity: Record<FeedbackSeverity, number>;
  byType: Record<FeedbackType, number>;
  averageResolutionTime: number; // в годинах
  openSince: Record<string, number>; // дні -> кількість
}

// Опції для FeedbackPinTool
export interface PinToolOptions {
  enabled: boolean;
  screenshotQuality?: number; // 0-1
  allowedSelectors?: string[]; // Дозволені CSS селектори
  excludedSelectors?: string[]; // Виключені CSS селектори
  onPinCreated?: (pinData: PinData) => void;
  onCancel?: () => void;
}

// Результат створення pin
export interface PinResult {
  success: boolean;
  pinData?: PinData;
  error?: string;
}