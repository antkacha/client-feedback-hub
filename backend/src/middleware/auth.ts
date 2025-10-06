import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { User } from '@prisma/client';
import { AppError } from './errorHandler';

// Типи ролей як константи
const USER_ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER', 
  ADMIN: 'ADMIN'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

const prisma = new PrismaClient();

// Middleware для перевірки JWT токена
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Токен доступу не наданий', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT секрет не налаштований', 500);
    }

    // Перевірка та декодування токена
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Знаходження користувача в базі даних
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('Користувач не знайдений', 401);
    }

    if (!user.isActive) {
      throw new AppError('Обліковий запис деактивований', 401);
    }

    // Додаємо користувача до запиту
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Недійсний токен', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Токен прострочений', 401));
    }
    next(error);
  }
};

// Middleware для перевірки ролей користувача
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Користувач не автентифікований', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Недостатньо прав доступу', 403));
    }

    next();
  };
};

// Middleware для перевірки власності ресурсу
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Користувач не автентифікований', 401));
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return next(new AppError('ID ресурсу не вказано', 400));
      }

      // Для адміністраторів дозволяємо доступ до всіх ресурсів
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Перевіряємо власність проєкту
      if (req.route.path.includes('/projects')) {
        const project = await prisma.project.findUnique({
          where: { id: resourceId },
          select: { ownerId: true }
        });

        if (!project) {
          return next(new AppError('Проєкт не знайдений', 404));
        }

        if (project.ownerId !== req.user.id) {
          return next(new AppError('Доступ заборонений', 403));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Опціональна автентифікація (не обов'язкова)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Продовжуємо без користувача
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ігноруємо помилки автентифікації для опціональної авторизації
    next();
  }
};