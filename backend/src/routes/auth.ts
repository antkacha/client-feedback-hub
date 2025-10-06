import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Публічні маршрути (з rate limiting)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Захищені маршрути
router.get('/me', authenticateToken, getCurrentUser);

export default router;