/**
 * Логгер для додатку
 * Використовує winston для структурованого логування
 */

import winston from 'winston';
import path from 'path';

// Формат для логів в development режимі
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${service || 'app'}] ${level}: ${message} ${metaString}`;
  })
);

// Формат для логів в production режимі
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Створює логгер з заданими параметрами
 * @param service - Назва сервісу для логування
 * @returns Winston logger instance
 */
export function createLogger(service: string = 'app'): winston.Logger {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Конфігурація транспортів
  const transports: winston.transport[] = [];

  // Консольний транспорт
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      format: isProduction ? productionFormat : developmentFormat,
    })
  );

  // Файлові транспорти в production
  if (isProduction) {
    // Логи помилок
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );

    // Загальні логи
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  }

  return winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: productionFormat,
    defaultMeta: { service },
    transports,
    // Не завершуємо процес при помилці логування
    exitOnError: false,
  });
}

// Експортуємо дефолтний логгер
export const logger = createLogger();