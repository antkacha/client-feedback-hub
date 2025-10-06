/**
 * Middleware для логування HTTP запитів
 * Доповнює стандартний morgan додатковою інформацією
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('http');

/**
 * Кастомний middleware для логування HTTP запитів
 * Додає додаткову інформацію до логів
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  
  // Логуємо початок запиту
  logger.debug('HTTP запит розпочато', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    timestamp: new Date().toISOString(),
  });

  // Перехоплюємо завершення відповіді
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Логуємо завершення запиту
    logger.info('HTTP запит завершено', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
    });

    return originalSend.call(this, data);
  };

  next();
}