/**
 * Zod схеми для валідації API запитів
 * Централізовані схеми валідації для всіх endpoints
 */

import { z } from 'zod';

// ========================================
// Auth Schemas
// ========================================

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Неправильний формат email')
      .max(255, 'Email занадто довгий'),
    password: z
      .string()
      .min(6, 'Пароль має бути не менше 6 символів')
      .max(100, 'Пароль занадто довгий'),
    firstName: z
      .string()
      .min(1, 'Ім\'я є обов\'язковим')
      .max(50, 'Ім\'я занадто довге')
      .trim(),
    lastName: z
      .string()
      .min(1, 'Прізвище є обов\'язковим')
      .max(50, 'Прізвище занадто довге')
      .trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Неправильний формат email'),
    password: z
      .string()
      .min(1, 'Пароль є обов\'язковим'),
  }),
});

// ========================================
// Project Schemas
// ========================================

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Назва проекту є обов\'язковою')
      .max(100, 'Назва проекту занадто довга')
      .trim(),
    description: z
      .string()
      .max(500, 'Опис занадто довгий')
      .optional(),
    websiteUrl: z
      .string()
      .url('Неправильний формат URL')
      .optional()
      .or(z.literal('')),
    settings: z
      .record(z.any())
      .optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Назва проекту не може бути порожньою')
      .max(100, 'Назва проекту занадто довга')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Опис занадто довгий')
      .optional(),
    websiteUrl: z
      .string()
      .url('Неправильний формат URL')
      .optional()
      .or(z.literal('')),
    isActive: z
      .boolean()
      .optional(),
    settings: z
      .record(z.any())
      .optional(),
  }),
  params: z.object({
    id: z
      .string()
      .uuid('Неправильний формат ID проекту'),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Неправильний формат ID проекту'),
  }),
});

export const getProjectsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Номер сторінки має бути більше 0'),
    limit: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Ліміт має бути від 1 до 100'),
    search: z
      .string()
      .max(100, 'Пошуковий запит занадто довгий')
      .optional(),
    sortBy: z
      .enum(['name', 'createdAt', 'updatedAt'])
      .optional(),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional(),
  }),
});

// ========================================
// Feedback Schemas
// ========================================

export const createFeedbackSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Заголовок фідбеку є обов\'язковим')
      .max(200, 'Заголовок занадто довгий')
      .trim(),
    description: z
      .string()
      .max(2000, 'Опис занадто довгий')
      .optional(),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .optional(),
    category: z
      .string()
      .max(50, 'Категорія занадто довга')
      .optional(),
    position: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    metadata: z
      .record(z.any())
      .optional(),
  }),
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
  }),
});

export const updateFeedbackSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Заголовок фідбеку не може бути порожнім')
      .max(200, 'Заголовок занадто довгий')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Опис занадто довгий')
      .optional(),
    status: z
      .enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .optional(),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .optional(),
    category: z
      .string()
      .max(50, 'Категорія занадто довга')
      .optional(),
    position: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    metadata: z
      .record(z.any())
      .optional(),
  }),
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
    id: z
      .string()
      .uuid('Неправильний формат ID фідбеку'),
  }),
});

export const getFeedbackSchema = z.object({
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
    id: z
      .string()
      .uuid('Неправильний формат ID фідбеку'),
  }),
});

export const getFeedbacksSchema = z.object({
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Номер сторінки має бути більше 0'),
    limit: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Ліміт має бути від 1 до 100'),
    status: z
      .enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .optional(),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .optional(),
    search: z
      .string()
      .max(100, 'Пошуковий запит занадто довгий')
      .optional(),
  }),
});

// ========================================
// Comment Schemas
// ========================================

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Коментар не може бути порожнім')
      .max(1000, 'Коментар занадто довгий')
      .trim(),
  }),
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
    feedbackId: z
      .string()
      .uuid('Неправильний формат ID фідбеку'),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Коментар не може бути порожнім')
      .max(1000, 'Коментар занадто довгий')
      .trim(),
  }),
  params: z.object({
    projectId: z
      .string()
      .uuid('Неправильний формат ID проекту'),
    feedbackId: z
      .string()
      .uuid('Неправильний формат ID фідбеку'),
    id: z
      .string()
      .uuid('Неправильний формат ID коментаря'),
  }),
});

// ========================================
// Common Schemas
// ========================================

export const uuidParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Неправильний формат ID'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Номер сторінки має бути більше 0'),
    limit: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Ліміт має бути від 1 до 100'),
  }),
});

// ========================================
// Type exports
// ========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;