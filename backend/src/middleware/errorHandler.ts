import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Типи для помилок
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Глобальний обробник помилок
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Внутрішня помилка сервера';
  let errors: string[] = [];

  // Логування помилки
  console.error('🚨 Помилка:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Обробка різних типів помилок
  if (error instanceof AppError) {
    // Наші кастомні помилки
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    // Помилки валідації Zod
    statusCode = 400;
    message = 'Помилка валідації даних';
    errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Помилки Prisma ORM
    statusCode = 400;
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        message = 'Запис з такими даними вже існує';
        break;
      case 'P2025':
        message = 'Запис не знайдено';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Порушення зв\'язку в базі даних';
        break;
      default:
        message = 'Помилка бази даних';
    }
  } else if (error.name === 'PrismaClientValidationError') {
    // Помилки валідації Prisma
    statusCode = 400;
    message = 'Невірні дані для бази даних';
  } else if (error.name === 'JsonWebTokenError') {
    // Помилки JWT
    statusCode = 401;
    message = 'Недійсний токен автентифікації';
  } else if (error.name === 'TokenExpiredError') {
    // Прострочений JWT
    statusCode = 401;
    message = 'Токен автентифікації прострочений';
  } else if (error.name === 'MulterError') {
    // Помилки завантаження файлів
    statusCode = 400;
    message = 'Помилка завантаження файлу';
  }

  // Відправка відповіді
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      originalError: error.message 
    })
  });
};

// Обробник для неіснуючих маршрутів
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не знайдено`
  });
};

// Wrapper для async функцій контролерів
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};