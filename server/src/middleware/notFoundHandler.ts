/**
 * Middleware для обробки 404 помилок
 * Викликається коли жоден маршрут не відповідає запиту
 */

import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/AppError';

/**
 * Обробник для неіснуючих маршрутів
 * Створює 404 помилку та передає її далі
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new NotFoundError(
    `Маршрут ${req.originalUrl} не знайдено на цьому сервері`,
    'route',
    req.originalUrl
  );
  
  next(error);
}