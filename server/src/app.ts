/**
 * Основний Express додаток
 * Налаштовує middleware, маршрути та обробку помилок
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Імпорт маршрутів
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import feedbackRoutes from './routes/feedback';

// Імпорт middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { createLogger } from './utils/logger';

// Ініціалізуємо логгер
const logger = createLogger('app');

/**
 * Створює та налаштовує Express додаток
 * @returns {Application} Налаштований Express додаток
 */
function createApp(): Application {
  const app: Application = express();

  // Налаштування довіри до проксі (для production з reverse proxy)
  app.set('trust proxy', 1);

  // Базові middleware для безпеки
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS налаштування
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // ліміт запитів
    message: {
      error: 'Занадто багато запитів з цієї IP адреси, спробуйте пізніше.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Парсінг тіла запитів
  app.use(express.json({ 
    limit: process.env.MAX_JSON_SIZE || '10mb',
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: process.env.MAX_URL_ENCODED_SIZE || '10mb',
  }));

  // Cookie parser
  app.use(cookieParser());

  // HTTP логування
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  // Кастомний middleware для логування запитів
  app.use(requestLogger);

  // Статичні файли (для завантажених зображень, документів тощо)
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Swagger API документація (тільки в development режимі)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const swaggerUi = require('swagger-ui-express');
      const { swaggerSpec } = require('./docs/swagger');
      
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Client Feedback Hub API Documentation',
      }));
      
      // JSON endpoint для swagger spec
      app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
      
      logger.info('📖 Swagger документація доступна на /api/docs');
    } catch (error) {
      logger.warn('⚠️ Не вдалося завантажити Swagger документацію:', error);
    }
  }

  // API маршрути
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/feedback', feedbackRoutes);

  // Базовий API endpoint
  app.get('/api', (req, res) => {
    res.json({
      message: 'Client Feedback Hub API',
      version: '1.0.0',
      documentation: process.env.NODE_ENV !== 'production' ? '/api/docs' : 'Not available in production',
      endpoints: {
        auth: '/api/auth',
        projects: '/api/projects',
        feedback: '/api/feedback',
      },
    });
  });

  // 404 handler для невідомих маршрутів
  app.use(notFoundHandler);

  // Глобальний обробник помилок (має бути останнім)
  app.use(errorHandler);

  logger.info('✅ Express додаток успішно налаштовано');

  return app;
}

// Створюємо та експортуємо додаток
const app = createApp();

export default app;