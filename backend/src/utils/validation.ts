import { z } from 'zod';

// Схеми для валідації користувачів
export const userCreateSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль повинен містити мінімум 6 символів'),
  firstName: z.string().min(1, 'Ім\'я обов\'язкове').max(50),
  lastName: z.string().min(1, 'Прізвище обов\'язкове').max(50),
  role: z.enum(['user', 'manager', 'admin']).optional()
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'manager', 'admin']).optional(),
  isActive: z.boolean().optional()
});

export const userLoginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Пароль обов\'язковий')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Поточний пароль обов\'язковий'),
  newPassword: z.string().min(6, 'Новий пароль повинен містити мінімум 6 символів')
});

// Схеми для валідації проєктів
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Назва проєкту обов\'язкова').max(100),
  description: z.string().min(1, 'Опис проєкту обов\'язковий').max(500),
  url: z.string().url('Невірний формат URL').optional().or(z.literal(''))
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  url: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional()
});

// Схеми для валідації координат pin tool
export const coordinatesSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  viewportWidth: z.number().positive(),
  viewportHeight: z.number().positive()
});

// Схеми для валідації фідбеків
export const feedbackCreateSchema = z.object({
  title: z.string().min(1, 'Заголовок обов\'язковий').max(200),
  description: z.string().min(1, 'Опис обов\'язковий').max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  projectId: z.string().cuid('Невірний ID проєкту'),
  authorEmail: z.string().email().optional(),
  authorName: z.string().max(100).optional(),
  coordinates: coordinatesSchema.optional(),
  selector: z.string().max(500).optional()
});

export const feedbackUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  coordinates: coordinatesSchema.optional(),
  selector: z.string().max(500).optional()
});

// Схема для фільтрації фідбеків
export const feedbackFilterSchema = z.object({
  projectId: z.string().cuid().optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  authorEmail: z.string().email().optional(),
  search: z.string().optional()
});

// Схеми для пагінації
export const paginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Схема для ID параметрів
export const idParamSchema = z.object({
  id: z.string().cuid('Невірний формат ID')
});

// Схема для завантаження файлів
export const fileUploadSchema = z.object({
  mimetype: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type),
    'Дозволені тільки зображення (JPEG, PNG, GIF, WebP)'
  ),
  size: z.number().max(5 * 1024 * 1024, 'Файл не повинен перевищувати 5MB')
});