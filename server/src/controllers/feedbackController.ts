/**
 * Контролер для управління фідбеками
 * CRUD операції для фідбеків проектів
 */

import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  AuthenticatedRequest, 
  CreateFeedbackData, 
  UpdateFeedbackData, 
  ApiResponse 
} from '../types';
import { 
  ValidationError, 
  NotFoundError, 
  AuthorizationError 
} from '../utils/AppError';
import { createLogger } from '../utils/logger';

const logger = createLogger('feedbackController');
const prisma = new PrismaClient();

/**
 * Перевірка доступу до проекту
 */
async function checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      isDeleted: false,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              isDeleted: false,
            },
          },
        },
      ],
    },
  });

  return !!project;
}

/**
 * Отримання фідбеків для проекту
 * GET /api/feedback/:projectId
 */
export async function getFeedbacks(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const projectId = req.params.projectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const search = req.query.search as string;

    // Перевіряємо доступ до проекту
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      throw new AuthorizationError('Немає доступу до цього проекту');
    }

    const skip = (page - 1) * limit;

    // Фільтри
    const where: any = {
      projectId,
      isDeleted: false,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Отримуємо загальну кількість
    const total = await prisma.feedback.count({ where });

    // Отримуємо фідбеки
    const feedbacks = await prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: {
          where: { isDeleted: false },
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<typeof feedbacks> = {
      success: true,
      message: 'Фідбеки отримано успішно',
      data: feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Отримання фідбеку за ID
 * GET /api/feedback/:projectId/:id
 */
export async function getFeedback(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const { projectId, id: feedbackId } = req.params;

    // Перевіряємо доступ до проекту
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      throw new AuthorizationError('Немає доступу до цього проекту');
    }

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        projectId,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: {
          where: { isDeleted: false },
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
          },
        },
        comments: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundError('Фідбек не знайдено');
    }

    const response: ApiResponse<typeof feedback> = {
      success: true,
      message: 'Фідбек отримано успішно',
      data: feedback,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Створення нового фідбеку
 * POST /api/feedback/:projectId
 */
export async function createFeedback(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const projectId = req.params.projectId;
    const { 
      title, 
      description, 
      priority, 
      category, 
      position,
      metadata 
    }: CreateFeedbackData = req.body;

    // Перевіряємо доступ до проекту
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      throw new AuthorizationError('Немає доступу до цього проекту');
    }

    // Валідація
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Заголовок фідбеку є обов\'язковим');
    }

    if (title.length > 200) {
      throw new ValidationError('Заголовок не може бути довшим за 200 символів');
    }

    // Створення фідбеку
    const feedback = await prisma.feedback.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        position: position || { x: 0, y: 0 },
        metadata: metadata || {},
        projectId,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    logger.info('Фідбек створено', {
      feedbackId: feedback.id,
      projectId,
      authorId: req.user.id,
    });

    const response: ApiResponse<typeof feedback> = {
      success: true,
      message: 'Фідбек створено успішно',
      data: feedback,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Оновлення фідбеку
 * PUT /api/feedback/:projectId/:id
 */
export async function updateFeedback(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const { projectId, id: feedbackId } = req.params;
    const { 
      title, 
      description, 
      status, 
      priority, 
      category, 
      position,
      metadata 
    }: UpdateFeedbackData = req.body;

    // Перевіряємо доступ до проекту
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      throw new AuthorizationError('Немає доступу до цього проекту');
    }

    // Перевіряємо чи існує фідбек
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        projectId,
        isDeleted: false,
      },
    });

    if (!existingFeedback) {
      throw new NotFoundError('Фідбек не знайдено');
    }

    // Валідація
    if (title !== undefined && (!title || title.trim().length === 0)) {
      throw new ValidationError('Заголовок фідбеку не може бути порожнім');
    }

    if (title !== undefined && title.length > 200) {
      throw new ValidationError('Заголовок не може бути довшим за 200 символів');
    }

    // Оновлення фідбеку
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(category !== undefined && { category }),
        ...(position !== undefined && { position }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: {
          where: { isDeleted: false },
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    logger.info('Фідбек оновлено', {
      feedbackId: feedback.id,
      projectId,
      userId: req.user.id,
    });

    const response: ApiResponse<typeof feedback> = {
      success: true,
      message: 'Фідбек оновлено успішно',
      data: feedback,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Видалення фідбеку (soft delete)
 * DELETE /api/feedback/:projectId/:id
 */
export async function deleteFeedback(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const { projectId, id: feedbackId } = req.params;

    // Перевіряємо доступ до проекту
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      throw new AuthorizationError('Немає доступу до цього проекту');
    }

    // Перевіряємо чи існує фідбек
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        projectId,
        isDeleted: false,
      },
    });

    if (!existingFeedback) {
      throw new NotFoundError('Фідбек не знайдено');
    }

    // Soft delete фідбеку та коментарів
    await prisma.$transaction([
      prisma.feedback.update({
        where: { id: feedbackId },
        data: { isDeleted: true },
      }),
      prisma.comment.updateMany({
        where: { feedbackId },
        data: { isDeleted: true },
      }),
      prisma.attachment.updateMany({
        where: { feedbackId },
        data: { isDeleted: true },
      }),
    ]);

    logger.info('Фідбек видалено', {
      feedbackId,
      projectId,
      userId: req.user.id,
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Фідбек видалено успішно',
      data: null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}