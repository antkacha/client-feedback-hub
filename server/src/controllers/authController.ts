/**
 * Контролер для автентифікації користувачів
 * Реєстрація, вхід, вихід, оновлення токенів
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  RegisterData, 
  LoginData, 
  JwtPayload, 
  AuthenticatedRequest, 
  ApiResponse 
} from '../types';
import { 
  registerSchema, 
  loginSchema 
} from '../utils/validation';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError, 
  NotFoundError 
} from '../utils/AppError';
import { createLogger } from '../utils/logger';

const logger = createLogger('authController');
const prisma = new PrismaClient();

// Константи для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Генерує JWT access token
 */
function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Генерує refresh token
 */
function generateRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign(
    { userId, tokenId },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Встановлює httpOnly cookie з токенами
 */
function setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
  const isSecure = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 хвилин
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  });
}

/**
 * Очищає cookie з токенами
 */
function clearTokenCookies(res: Response): void {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

/**
 * Реєстрація нового користувача
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName }: RegisterData = req.body;

    // Валідація даних
    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError('Всі поля є обов\'язковими');
    }

    if (password.length < 6) {
      throw new ValidationError('Пароль має бути не менше 6 символів');
    }

    // Перевірка чи користувач вже існує
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Користувач з таким email вже існує');
    }

    // Хешування пароля
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Створення користувача
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER', // За замовчуванням роль USER
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Генерація токенів
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);

    // Створення refresh token в БД
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
      },
    });

    const refreshToken = generateRefreshToken(user.id, refreshTokenRecord.id);

    // Встановлення cookies
    setTokenCookies(res, accessToken, refreshToken);

    logger.info('Користувач успішно зареєстрований', { userId: user.id, email: user.email });

    const response: ApiResponse<typeof user> = {
      success: true,
      message: 'Користувач успішно зареєстрований',
      data: user,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Вхід користувача
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password }: LoginData = req.body;

    // Валідація даних
    if (!email || !password) {
      throw new ValidationError('Email та пароль є обов\'язковими');
    }

    // Пошук користувача
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        isDeleted: false,
      },
    });

    if (!user) {
      throw new AuthenticationError('Неправильний email або пароль');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Акаунт деактивовано');
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Неправильний email або пароль');
    }

    // Генерація токенів
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);

    // Створення refresh token в БД
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
      },
    });

    const refreshToken = generateRefreshToken(user.id, refreshTokenRecord.id);

    // Встановлення cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Оновлюємо дату останнього входу
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info('Користувач успішно увійшов', { userId: user.id, email: user.email });

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    const response: ApiResponse<typeof userResponse> = {
      success: true,
      message: 'Успішний вхід',
      data: userResponse,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Вихід користувача
 * POST /api/auth/logout
 */
export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { tokenId: string };
        
        // Видаляємо refresh token з БД
        await prisma.refreshToken.delete({
          where: { id: decoded.tokenId },
        });
      } catch (error) {
        // Ігноруємо помилки JWT при logout
        logger.warn('Помилка при видаленні refresh token:', error);
      }
    }

    // Очищуємо cookies
    clearTokenCookies(res);

    logger.info('Користувач вийшов', { userId: req.user?.id });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Успішний вихід',
      data: null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Оновлення access token за допомогою refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token не надано');
    }

    // Перевірка refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; tokenId: string };

    // Перевірка чи існує refresh token в БД
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { 
        id: decoded.tokenId,
        userId: decoded.userId,
      },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token недійсний');
    }

    // Отримання користувача
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isDeleted: false,
        isActive: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Користувач не знайдений');
    }

    // Генерація нового access token
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(jwtPayload);

    // Встановлення нового access token cookie
    const isSecure = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 хвилин
    });

    logger.debug('Access token оновлено', { userId: user.id });

    const response: ApiResponse<{ accessToken: string }> = {
      success: true,
      message: 'Token оновлено',
      data: { accessToken: newAccessToken },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Отримання інформації про поточного користувача
 * GET /api/auth/me
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AuthenticationError('Користувач не автентифікований');
    }

    const response: ApiResponse<typeof req.user> = {
      success: true,
      message: 'Дані користувача отримано',
      data: req.user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}