import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// Основний rate limiter для всіх запитів
const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // Кількість запитів
  duration: 60, // За 60 секунд
});

// Строгіший limiter для аутентифікації
const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 10, // 10 спроб (збільшено для розробки)
  duration: 300, // За 5 хвилин
  blockDuration: 300, // Блокування на 5 хвилин (зменшено)
});

// Limiter для створення контенту (проєкти, фідбеки)
const createLimiter = new RateLimiterMemory({
  keyPrefix: 'create',
  points: 20, // 20 створень
  duration: 60, // За хвилину
});

// Загальний rate limiter middleware
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'unknown';
    await generalLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Забагато запитів. Спробуйте пізніше.',
      retryAfter: secs
    });
  }
};

// Функція для очищення rate limits (для адмінів)
export const clearRateLimit = async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;
    const targetIp = ip || req.ip || 'unknown';

    // Очищуємо всі типи лімітів для цього IP
    await Promise.all([
      generalLimiter.delete(targetIp),
      authLimiter.delete(targetIp), 
      createLimiter.delete(targetIp)
    ]);

    res.json({
      success: true,
      message: `Rate limits очищено для IP: ${targetIp}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка очищення rate limits'
    });
  }
};

// Rate limiter для аутентифікації з виключенням для адмінів
export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Перевіряємо, чи це адмін за email
    const isAdminEmail = req.body?.email && (
      req.body.email === 'admin@cfh.local' || 
      req.body.email.includes('admin@') ||
      req.body.email === 'root@cfh.local'
    );

    // Якщо це адмін, пропускаємо rate limiting
    if (isAdminEmail) {
      console.log(`🛡️  Rate limiting bypassed for admin: ${req.body.email}`);
      return next();
    }

    // Для звичайних користувачів застосовуємо rate limiting
    const key = req.ip || 'unknown';
    await authLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Забагато спроб входу. Спробуйте через кілька хвилин.',
      retryAfter: secs
    });
  }
};

// Rate limiter для створення контенту
export const createRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'unknown';
    await createLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Забагато операцій створення. Спробуйте пізніше.',
      retryAfter: secs
    });
  }
};