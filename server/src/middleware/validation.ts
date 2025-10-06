/**
 * Middleware для валідації запитів за допомогою Zod схем
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';
import { createLogger } from '../utils/logger';

const logger = createLogger('validation');

/**
 * Middleware для валідації запиту за Zod схемою
 * @param schema - Zod схема для валідації
 */
export function validate(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Валідуємо запит (body, params, query)
      const validatedData = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Оновлюємо запит з валідованими даними
      req.body = validatedData.body || req.body;
      req.params = validatedData.params || req.params;
      req.query = validatedData.query || req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Форматуємо помилки валідації
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Помилка валідації запиту', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
        });

        // Створюємо зрозуміле повідомлення про помилку
        const firstError = validationErrors[0];
        const message = firstError ? firstError.message : 'Помилка валідації даних';

        return next(new ValidationError(message, firstError?.field));
      }

      next(error);
    }
  };
}

/**
 * Спеціальний middleware для валідації тільки body
 * @param schema - Zod схема для body
 */
export function validateBody(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Помилка валідації body', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
        });

        const firstError = validationErrors[0];
        const message = firstError ? firstError.message : 'Помилка валідації даних';

        return next(new ValidationError(message, firstError?.field));
      }

      next(error);
    }
  };
}

/**
 * Спеціальний middleware для валідації параметрів URL
 * @param schema - Zod схема для params
 */
export function validateParams(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Помилка валідації параметрів', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
        });

        const firstError = validationErrors[0];
        const message = firstError ? firstError.message : 'Помилка валідації параметрів';

        return next(new ValidationError(message, firstError?.field));
      }

      next(error);
    }
  };
}

/**
 * Спеціальний middleware для валідації query параметрів
 * @param schema - Zod схема для query
 */
export function validateQuery(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Помилка валідації query', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
        });

        const firstError = validationErrors[0];
        const message = firstError ? firstError.message : 'Помилка валідації query параметрів';

        return next(new ValidationError(message, firstError?.field));
      }

      next(error);
    }
  };
}