/**
 * Контролер для управління проектами
 * CRUD операції для проектів та управління учасниками
 */

import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  AuthenticatedRequest, 
  CreateProjectData, 
  UpdateProjectData, 
  ApiResponse,
  PaginationParams,
  FilterParams
} from '../types';
import { 
  ValidationError, 
  NotFoundError, 
  AuthorizationError 
} from '../utils/AppError';
import { createLogger } from '../utils/logger';

const logger = createLogger('projectController');
const prisma = new PrismaClient();

/**
 * Отримання списку проектів користувача
 * GET /api/projects
 */
export async function getProjects(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    // Фільтри для пошуку
    const where: any = {
      isDeleted: false,
      OR: [
        { ownerId: req.user.id },
        {
          members: {
            some: {
              userId: req.user.id,
              isDeleted: false,
            },
          },
        },
      ],
    };

    // Додаємо пошук за назвою
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Отримуємо загальну кількість
    const total = await prisma.project.count({ where });

    // Отримуємо проекти
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            feedbacks: {
              where: { isDeleted: false },
            },
            members: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);
    
    const response: ApiResponse<typeof projects> = {
      success: true,
      message: 'Проекти отримано успішно',
      data: projects,
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
 * Отримання проекту за ID
 * GET /api/projects/:id
 */
export async function getProject(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const projectId = req.params.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
        OR: [
          { ownerId: req.user.id },
          {
            members: {
              some: {
                userId: req.user.id,
                isDeleted: false,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            feedbacks: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Проект не знайдено');
    }

    const response: ApiResponse<typeof project> = {
      success: true,
      message: 'Проект отримано успішно',
      data: project,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Створення нового проекту
 * POST /api/projects
 */
export async function createProject(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const { name, description, websiteUrl, settings }: CreateProjectData = req.body;

    // Валідація
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Назва проекту є обов\'язковою');
    }

    if (name.length > 100) {
      throw new ValidationError('Назва проекту не може бути довшою за 100 символів');
    }

    // Створення проекту
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        websiteUrl: websiteUrl?.trim(),
        settings: settings || {},
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            feedbacks: true,
            members: true,
          },
        },
      },
    });

    logger.info('Проект створено', {
      projectId: project.id,
      projectName: project.name,
      ownerId: req.user.id,
    });

    const response: ApiResponse<typeof project> = {
      success: true,
      message: 'Проект створено успішно',
      data: project,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Оновлення проекту
 * PUT /api/projects/:id
 */
export async function updateProject(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const projectId = req.params.id;
    const { name, description, websiteUrl, isActive, settings }: UpdateProjectData = req.body;

    // Перевіряємо чи існує проект та чи користувач має права
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
        ownerId: req.user.id, // Тільки власник може редагувати
      },
    });

    if (!existingProject) {
      throw new NotFoundError('Проект не знайдено або немає прав для редагування');
    }

    // Валідація
    if (name !== undefined && (!name || name.trim().length === 0)) {
      throw new ValidationError('Назва проекту не може бути порожньою');
    }

    if (name !== undefined && name.length > 100) {
      throw new ValidationError('Назва проекту не може бути довшою за 100 символів');
    }

    // Оновлення проекту
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl?.trim() }),
        ...(isActive !== undefined && { isActive }),
        ...(settings !== undefined && { settings }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            feedbacks: {
              where: { isDeleted: false },
            },
            members: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    logger.info('Проект оновлено', {
      projectId: project.id,
      projectName: project.name,
      ownerId: req.user.id,
    });

    const response: ApiResponse<typeof project> = {
      success: true,
      message: 'Проект оновлено успішно',
      data: project,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Видалення проекту (soft delete)
 * DELETE /api/projects/:id
 */
export async function deleteProject(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ValidationError('Користувач не автентифікований');
    }

    const projectId = req.params.id;

    // Перевіряємо чи існує проект та чи користувач має права
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
        ownerId: req.user.id, // Тільки власник може видаляти
      },
    });

    if (!existingProject) {
      throw new NotFoundError('Проект не знайдено або немає прав для видалення');
    }

    // Soft delete проекту та всіх пов'язаних даних
    await prisma.$transaction([
      // Видаляємо проект
      prisma.project.update({
        where: { id: projectId },
        data: { isDeleted: true },
      }),
      // Видаляємо всі фідбеки проекту
      prisma.feedback.updateMany({
        where: { projectId },
        data: { isDeleted: true },
      }),
      // Видаляємо всіх учасників проекту
      prisma.projectMember.updateMany({
        where: { projectId },
        data: { isDeleted: true },
      }),
    ]);

    logger.info('Проект видалено', {
      projectId,
      ownerId: req.user.id,
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Проект видалено успішно',
      data: null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}