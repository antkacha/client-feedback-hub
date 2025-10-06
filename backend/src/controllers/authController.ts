import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { CreateUserDto, LoginDto, UserRole } from '../types';

const prisma = new PrismaClient();

// Схеми валідації
const registerSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль повинен містити мінімум 6 символів'),
  firstName: z.string().min(1, 'Ім\'я обов\'язкове'),
  lastName: z.string().min(1, 'Прізвище обов\'язкове'),
  role: z.enum(['user', 'manager', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Пароль обов\'язковий')
});

// Генерація JWT токенів
const generateTokens = (userId: string, email: string, role: UserRole) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new AppError('JWT секрети не налаштовані', 500);
  }

  const accessToken = jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Реєстрація нового користувача
export const register = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  // Перевірка на існування користувача
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (existingUser) {
    throw new AppError('Користувач з таким email вже існує', 409);
  }

  // Хешування паролю
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  // Створення користувача
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role || 'USER'
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  // Генерація токенів
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as UserRole);

  // Встановлення refresh token в httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
  });

  res.status(201).json({
    success: true,
    message: 'Користувач успішно зареєстрований',
    data: {
      user,
      accessToken
    }
  });
});

// Вхід користувача
export const login = catchAsync(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  // Знаходження користувача
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (!user) {
    throw new AppError('Невірний email або пароль', 401);
  }

  if (!user.isActive) {
    throw new AppError('Обліковий запис деактивований', 401);
  }

  // Перевірка паролю
  const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Невірний email або пароль', 401);
  }

  // Генерація токенів
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as UserRole);

  // Встановлення refresh token в cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
  });

  res.json({
    success: true,
    message: 'Успішний вхід в систему',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      accessToken
    }
  });
});

// Оновлення access token через refresh token
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token не наданий', 401);
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new AppError('JWT refresh секрет не налаштований', 500);
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
    
    // Перевірка існування користувача
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw new AppError('Користувач не знайдений або деактивований', 401);
    }

    // Генерація нових токенів
    const tokens = generateTokens(user.id, user.email, user.role as UserRole);

    // Встановлення нового refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    throw new AppError('Недійсний refresh token', 401);
  }
});

// Вихід користувача
export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Успішний вихід з системи'
  });
});

// Отримання поточного користувача
export const getCurrentUser = catchAsync(async (req: any, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});