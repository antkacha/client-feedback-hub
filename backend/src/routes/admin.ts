import { Router } from 'express';
import { clearRateLimit } from '../middleware/rateLimiter';

const router = Router();

// TODO: Додати контролери для адміністрування (тільки для адміністраторів)

// Статистика системи
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Статистика адмін панелі - TODO: реалізувати контролер'
  });
});

// Управління користувачами
router.get('/users', (req, res) => {
  res.json({
    success: true,
    message: 'Список всіх користувачів - TODO: реалізувати контролер'
  });
});

// Блокування/розблокування користувача
router.put('/users/:id/toggle-status', (req, res) => {
  res.json({
    success: true,
    message: `Зміна статусу користувача ${req.params.id} - TODO: реалізувати контролер`
  });
});

// Зміна ролі користувача
router.put('/users/:id/role', (req, res) => {
  res.json({
    success: true,
    message: `Зміна ролі користувача ${req.params.id} - TODO: реалізувати контролер`
  });
});

// Системні налаштування
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    message: 'Системні налаштування - TODO: реалізувати контролер'
  });
});

// Логи системи
router.get('/logs', (req, res) => {
  res.json({
    success: true,
    message: 'Системні логи - TODO: реалізувати контролер'
  });
});

// Очищення rate limits (тільки для адмінів)
router.post('/clear-rate-limits', clearRateLimit);

export default router;