/**
 * Маршрути для автентифікації
 * Реєстрація, вхід, вихід, оновлення токенів
 */

import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
} from '../controllers/authController';
import { verifyAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Реєстрація нового користувача
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Вхід користувача
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Вихід користувача
 * @access  Private
 */
router.post('/logout', verifyAuth, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Оновлення access token
 * @access  Public (потребує refresh token в cookies)
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Отримання інформації про поточного користувача
 * @access  Private
 */
router.get('/me', verifyAuth, getCurrentUser);

export default router;