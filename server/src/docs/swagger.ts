/**
 * OpenAPI документація для Client Feedback Hub API
 * Використовується swagger-ui-express для відображення інтерактивної документації
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

/**
 * Базова конфігурація Swagger
 */
const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Client Feedback Hub API',
    version: '1.0.0',
    description: 'REST API для системи збору та управління feedback від клієнтів',
    contact: {
      name: 'API Support',
      email: 'support@clientfeedbackhub.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.clientfeedbackhub.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Access Token для автентифікації',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HTTP-only cookie з refresh token',
      },
    },
    schemas: {
      // Базові схеми відповідей
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Статус виконання запиту',
            example: true,
          },
          data: {
            description: 'Дані відповіді (залежить від endpoint)',
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Код помилки',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                description: 'Повідомлення про помилку',
                example: 'Невірні дані запиту',
              },
              details: {
                type: 'object',
                description: 'Додаткові деталі помилки',
              },
            },
          },
        },
        required: ['success'],
      },

      // Пагінація
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            description: 'Поточна сторінка',
            example: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'Кількість елементів на сторінці',
            example: 10,
          },
          total: {
            type: 'integer',
            minimum: 0,
            description: 'Загальна кількість елементів',
            example: 45,
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
            description: 'Загальна кількість сторінок',
            example: 5,
          },
          hasNext: {
            type: 'boolean',
            description: 'Чи є наступна сторінка',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            description: 'Чи є попередня сторінка',
            example: false,
          },
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'],
      },

      // Користувач
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Унікальний ідентифікатор користувача',
            example: 'usr_1234567890',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email адреса користувача',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            description: 'Ім\'я користувача',
            example: 'Олексій',
          },
          lastName: {
            type: 'string',
            description: 'Прізвище користувача',
            example: 'Петренко',
          },
          role: {
            type: 'string',
            enum: ['admin', 'manager', 'member'],
            description: 'Роль користувача в системі',
            example: 'member',
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'URL аватара користувача',
            example: 'https://example.com/avatars/user123.jpg',
          },
          isActive: {
            type: 'boolean',
            description: 'Чи активний користувач',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата створення облікового запису',
            example: '2024-01-15T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата останнього оновлення',
            example: '2024-09-20T14:45:00Z',
          },
        },
        required: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
      },

      // Проект
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Унікальний ідентифікатор проекту',
            example: 'prj_1234567890',
          },
          name: {
            type: 'string',
            description: 'Назва проекту',
            example: 'Головний сайт компанії',
          },
          description: {
            type: 'string',
            description: 'Опис проекту',
            example: 'Корпоративний сайт з інформацією про компанію та послуги',
          },
          url: {
            type: 'string',
            format: 'uri',
            nullable: true,
            description: 'URL проекту (опціонально)',
            example: 'https://company.com',
          },
          isActive: {
            type: 'boolean',
            description: 'Чи активний проект',
            example: true,
          },
          ownerId: {
            type: 'string',
            description: 'ID власника проекту',
            example: 'usr_1234567890',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата створення проекту',
            example: '2024-01-15T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата останнього оновлення',
            example: '2024-09-20T14:45:00Z',
          },
          _count: {
            type: 'object',
            properties: {
              feedbacks: {
                type: 'integer',
                description: 'Кількість feedback у проекті',
                example: 23,
              },
            },
          },
        },
        required: ['id', 'name', 'description', 'isActive', 'ownerId', 'createdAt', 'updatedAt'],
      },

      // Feedback
      Feedback: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Унікальний ідентифікатор feedback',
            example: 'fb_1234567890',
          },
          title: {
            type: 'string',
            description: 'Заголовок feedback',
            example: 'Кнопка не працює на головній сторінці',
          },
          description: {
            type: 'string',
            description: 'Детальний опис feedback',
            example: 'При натисканні на кнопку "Зберегти" нічого не відбувається',
          },
          status: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
            description: 'Статус feedback',
            example: 'OPEN',
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: 'Пріоритет feedback',
            example: 'HIGH',
          },
          category: {
            type: 'string',
            description: 'Категорія feedback',
            example: 'bug',
          },
          projectId: {
            type: 'string',
            description: 'ID проекту до якого належить feedback',
            example: 'prj_1234567890',
          },
          userId: {
            type: 'string',
            description: 'ID користувача який створив feedback',
            example: 'usr_1234567890',
          },
          assignedToId: {
            type: 'string',
            nullable: true,
            description: 'ID користувача якому призначено feedback',
            example: 'usr_0987654321',
          },
          browserInfo: {
            type: 'string',
            nullable: true,
            description: 'Інформація про браузер',
            example: 'Chrome 120.0.0.0 on Windows 11',
          },
          pageUrl: {
            type: 'string',
            nullable: true,
            description: 'URL сторінки де виявлено проблему',
            example: 'https://company.com/profile/edit',
          },
          screenshot: {
            type: 'string',
            nullable: true,
            description: 'URL скріншоту',
            example: 'https://storage.company.com/screenshots/fb_123.png',
          },
          metadata: {
            type: 'object',
            nullable: true,
            description: 'Додаткові метадані (JSON)',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата створення feedback',
            example: '2024-12-20T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата останнього оновлення',
            example: '2024-12-20T15:45:00Z',
          },
          resolvedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Дата вирішення feedback',
            example: '2024-12-21T09:15:00Z',
          },
        },
        required: ['id', 'title', 'description', 'status', 'priority', 'projectId', 'userId', 'createdAt', 'updatedAt'],
      },

      // Коментар
      Comment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Унікальний ідентифікатор коментаря',
            example: 'cmt_1234567890',
          },
          content: {
            type: 'string',
            description: 'Текст коментаря',
            example: 'Дякую за звіт! Працюємо над виправленням.',
          },
          feedbackId: {
            type: 'string',
            description: 'ID feedback до якого належить коментар',
            example: 'fb_1234567890',
          },
          userId: {
            type: 'string',
            description: 'ID користувача який створив коментар',
            example: 'usr_1234567890',
          },
          user: {
            $ref: '#/components/schemas/User',
            description: 'Дані користувача який створив коментар',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата створення коментаря',
            example: '2024-12-20T16:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата останнього оновлення',
            example: '2024-12-20T16:30:00Z',
          },
        },
        required: ['id', 'content', 'feedbackId', 'userId', 'createdAt', 'updatedAt'],
      },

      // Прикріплений файл
      Attachment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Унікальний ідентифікатор файлу',
            example: 'att_1234567890',
          },
          fileName: {
            type: 'string',
            description: 'Назва файлу',
            example: 'screenshot.png',
          },
          originalName: {
            type: 'string',
            description: 'Оригінальна назва файлу',
            example: 'Знімок екрана 2024-12-20 о 10.30.45.png',
          },
          mimeType: {
            type: 'string',
            description: 'MIME тип файлу',
            example: 'image/png',
          },
          size: {
            type: 'integer',
            description: 'Розмір файлу в байтах',
            example: 245760,
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL для завантаження файлу',
            example: 'https://storage.company.com/attachments/att_123.png',
          },
          feedbackId: {
            type: 'string',
            description: 'ID feedback до якого прикріплено файл',
            example: 'fb_1234567890',
          },
          uploadedBy: {
            type: 'string',
            description: 'ID користувача який завантажив файл',
            example: 'usr_1234567890',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата завантаження файлу',
            example: '2024-12-20T10:35:00Z',
          },
        },
        required: ['id', 'fileName', 'originalName', 'mimeType', 'size', 'url', 'feedbackId', 'uploadedBy', 'createdAt'],
      },
    },
  },
  // Глобальна безпека - всі endpoint вимагають JWT токен (окрім auth)
  security: [
    {
      bearerAuth: [],
    },
  ],
};

/**
 * Опції для swagger-jsdoc
 */
const swaggerOptions = {
  definition: swaggerDefinition,
  // Шляхи до файлів з JSDoc коментарями
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/middleware/*.ts',
    './swagger-docs.ts', // цей файл також може містити додаткові описи
  ],
};

/**
 * Генерація Swagger специфікації
 */
export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Додаткові описи endpoint через JSDoc коментарі
 * Ці коментарі будуть автоматично підхоплені swagger-jsdoc
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Автентифікація та авторизація користувачів
 *   - name: Projects
 *     description: Управління проектами
 *   - name: Feedback
 *     description: Робота з feedback та коментарями
 *   - name: Files
 *     description: Завантаження та управління файлами
 *   - name: Users
 *     description: Управління користувачами (тільки для адміністраторів)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Реєстрація нового користувача
 *     description: Створює новий обліковий запис користувача в системі
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass123!
 *               firstName:
 *                 type: string
 *                 example: Олексій
 *               lastName:
 *                 type: string
 *                 example: Петренко
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abc123...; HttpOnly; Secure; SameSite=Strict
 *       400:
 *         description: Невірні дані запиту
 *       409:
 *         description: Користувач з таким email вже існує
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Вхід користувача в систему
 *     description: Автентифікація користувача за email та паролем
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Успішний вхід в систему
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Невірний email або пароль
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Отримання списку проектів
 *     description: Повертає пагінований список проектів поточного користувача
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер сторінки
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Кількість елементів на сторінці
 *     responses:
 *       200:
 *         description: Список проектів успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Project'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Projects]
 *     summary: Створення нового проекту
 *     description: Створює новий проект для поточного користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Новий проект
 *               description:
 *                 type: string
 *                 example: Опис нового проекту
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://newproject.com
 *     responses:
 *       201:
 *         description: Проект успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 */

export default swaggerSpec;