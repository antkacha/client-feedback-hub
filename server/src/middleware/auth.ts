/**
 * Middleware для автентифікації JWT
 * Перевіряє access token та додає інформацію про користувача до запиту
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticationError, AuthorizationError } from '../utils/AppError';
import { JWTPayload, AuthenticatedRequest } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('auth');
const prisma = new PrismaClient();

/**
 * Витягує токен з заголовків або кукі
 */
function extractToken(req: Request): string | null {
  // Спочатку перевіряємо Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Потім перевіряємо httpOnly cookie
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Middleware для перевірки JWT токена
 * Додає інформацію про користувача до req.user
 */
export async function verifyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('Токен не надано');
    }

    // Перевіряємо JWT токен
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET не налаштовано');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Отримуємо користувача з бази даних
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Користувач не знайдений');
    }

    if (!user.isActive) {
      throw new AuthorizationError('Акаунт деактивовано');
    }

    // Додаємо користувача до запиту
    req.user = user;

    logger.debug('Користувач автентифікований', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Неправильний токен'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Токен прострочений'));
    } else {
      next(error);
    }
  }
}

/**
 * Middleware для перевірки ролей користувача
 * @param roles - Дозволені ролі
 */
export function requireRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Користувач не автентифікований'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('Недостатньо прав доступу'));
    }

    next();
  };
}

/**
 * Middleware для перевірки власності ресурсу
 * Перевіряє чи користувач є власником ресурсу або має роль ADMIN
 */
export function requireOwnershipOrAdmin(resourceIdParam: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Користувач не автентифікований'));
    }

    // Адміни мають доступ до всіх ресурсів
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const resourceId = req.params[resourceIdParam];
    if (!resourceId) {
      return next(new AuthenticationError('ID ресурсу не надано'));
    }

    // Тут можна додати логіку перевірки власності ресурсу
    // Наразі просто перевіряємо ID користувача
    if (resourceId === req.user.id) {
      return next();
    }

    return next(new AuthorizationError('Недостатньо прав доступу до ресурсу'));
  };
}

/**
 * Опціональна автентифікація
 * Не кидає помилку якщо токен відсутній, але додає користувача якщо токен валідний
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ігноруємо помилки JWT для опціональної автентифікації
    next();
  }
}