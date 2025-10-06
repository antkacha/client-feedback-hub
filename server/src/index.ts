/**
 * Головний файл запуску сервера
 * Ініціалізує Express додаток та підключає до бази даних
 */

import dotenv from 'dotenv';

// Завантажуємо змінні середовища перед усім іншим
dotenv.config();

import app from './app';
import { PrismaClient } from '@prisma/client';
import { createLogger } from './utils/logger';

// Ініціалізуємо логгер
const logger = createLogger('server');

// Ініціалізуємо Prisma клієнт
const prisma = new PrismaClient();

// Порт сервера з змінних середовища або за замовчуванням
const PORT = process.env.PORT || 3001;

/**
 * Функція для підключення до бази даних
 * Перевіряє з'єднання з PostgreSQL через Prisma
 */
async function connectToDatabase(): Promise<void> {
  try {
    // Перевіряємо підключення до бази даних
    await prisma.$connect();
    logger.info('✅ Успішно підключено до бази даних PostgreSQL');
  } catch (error) {
    logger.error('❌ Помилка підключення до бази даних:', error);
    process.exit(1);
  }
}

/**
 * Грейсфул завершення роботи сервера
 * Закриває підключення до БД та завершує процес
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`🔄 Отримано сигнал ${signal}. Розпочинаємо грейсфул завершення...`);
  
  try {
    // Закриваємо підключення до бази даних
    await prisma.$disconnect();
    logger.info('✅ З\'єднання з базою даних закрито');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Помилка при завершенні роботи:', error);
    process.exit(1);
  }
}

/**
 * Основна функція запуску сервера
 */
async function startServer(): Promise<void> {
  try {
    // Підключаємося до бази даних
    await connectToDatabase();
    
    // Запускаємо HTTP сервер
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Сервер запущено на порту ${PORT}`);
      logger.info(`📱 API доступне за адресою: http://localhost:${PORT}/api`);
      logger.info(`🌍 Середовище: ${process.env.NODE_ENV || 'development'}`);
    });

    // Налаштовуємо обробники для грейсфул завершення
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Обробник для неперехоплених помилок
    process.on('uncaughtException', (error) => {
      logger.error('❌ Неперехоплена помилка:', error);
      process.exit(1);
    });

    // Обробник для неперехоплених Promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Неперехоплений Promise rejection:', { reason, promise });
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('❌ Помилка запуску сервера:', error);
    process.exit(1);
  }
}

// Запускаємо сервер тільки якщо файл виконується напряму
if (require.main === module) {
  startServer();
}

export default startServer;