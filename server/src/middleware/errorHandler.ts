/**
 * Глобальний обробник помилок
 * Перехоплює всі помилки та відправляє відповідні HTTP відповіді
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '../utils/AppError';
import { createLogger } from '../utils/logger';

const logger = createLogger('errorHandler');

/**
 * Обробник помилок Prisma
 * Конвертує помилки Prisma в зрозумілі для користувача повідомлення
 */
function handlePrismaError(error: any): AppError {
  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'поле';
    return new AppError(`${field} вже використовується`, 409);
  }
  
  if (error.code === 'P2025') {
    // Record not found
    return new AppError('Запис не знайдено', 404);
  }
  
  if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new AppError('Порушення зв\'язку між записами', 400);
  }
  
  if (error.code === 'P2014') {
    // Required relation violation
    return new AppError('Відсутній обов\'язковий зв\'язок', 400);
  }

  // Загальна помилка Prisma
  logger.error('Невідома помилка Prisma:', { error: error.message, code: error.code });
  return new AppError('Помилка бази даних', 500);
}

/**
 * Обробник помилок JWT
 */
function handleJWTError(error: any): AppError {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Неправильний токен', 401);
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Токен прострочений', 401);
  }
  
  if (error.name === 'NotBeforeError') {
    return new AppError('Токен ще не активний', 401);
  }

  return new AppError('Помилка автентифікації', 401);
}

/**
 * Обробник помилок валідації
 */
function handleValidationError(error: any): AppError {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val: any) => val.message).join('. ');
    return new AppError(`Помилка валідації: ${message}`, 400);
  }

  return new AppError('Помилка валідації', 400);
}

/**
 * Відправляє помилку в development режимі
 */
function sendErrorDev(err: AppError, res: Response): void {
  res.status(err.statusCode).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

/**
 * Відправляє помилку в production режимі
 */
function sendErrorProd(err: AppError, res: Response): void {
  // Операційні помилки - відправляємо користувачу
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  } else {
    // Програмні помилки - не показуємо деталі
    logger.error('Програмна помилка:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Щось пішло не так!',
    });
  }
}

/**
 * Глобальний middleware обробки помилок
 * Має бути останнім middleware в ланцюжку
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err };
  error.message = err.message;

  // Логуємо помилку
  logger.error('Помилка:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Обробляємо різні типи помилок
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name && err.name.includes('JWT')) {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = new AppError('Неправильний формат даних', 400);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} вже використовується`, 409);
  } else if (!(err instanceof AppError)) {
    // Невідома помилка - конвертуємо в AppError
    error = new AppError(err.message || 'Внутрішня помилка сервера', 500, false);
  }

  // Відправляємо відповідь
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
}