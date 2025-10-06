/**
 * Кастомний клас помилок для додатку
 * Розширює стандартний Error додатковими полями
 */

/**
 * Кастомна помилка додатку з HTTP статус кодом
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Зберігаємо правильний stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Помилка валідації (400)
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message, 400);
    this.field = field;
    this.value = value;
  }
}

/**
 * Помилка автентифікації (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Необхідна автентифікація') {
    super(message, 401);
  }
}

/**
 * Помилка авторизації (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Недостатньо прав доступу') {
    super(message, 403);
  }
}

/**
 * Помилка "не знайдено" (404)
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string = 'Ресурс не знайдено',
    resource?: string,
    resourceId?: string | number
  ) {
    super(message, 404);
    this.resource = resource;
    this.resourceId = resourceId;
  }
}

/**
 * Помилка конфлікту (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Конфлікт даних') {
    super(message, 409);
  }
}

/**
 * Помилка rate limit (429)
 */
export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Занадто багато запитів', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Внутрішня помилка сервера (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Внутрішня помилка сервера') {
    super(message, 500, false);
  }
}

/**
 * Помилка сервісу недоступний (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Сервіс тимчасово недоступний') {
    super(message, 503);
  }
}

/**
 * Перевіряє чи є помилка операційною (очікуваною)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}