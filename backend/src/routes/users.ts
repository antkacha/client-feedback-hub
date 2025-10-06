import { Router } from 'express';

const router = Router();

// TODO: Додати контролери для управління користувачами
// Поки що створюємо базову структуру маршрутів

// Отримання списку всіх користувачів (тільки для адміністраторів)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Список користувачів - TODO: реалізувати контролер'
  });
});

// Отримання користувача за ID
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Користувач ${req.params.id} - TODO: реалізувати контролер`
  });
});

// Оновлення користувача
router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Оновлення користувача ${req.params.id} - TODO: реалізувати контролер`
  });
});

// Деактивація користувача
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Деактивація користувача ${req.params.id} - TODO: реалізувати контролер`
  });
});

export default router;