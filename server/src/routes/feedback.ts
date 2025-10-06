/**
 * Маршрути для управління фідбеками
 * CRUD операції для фідбеків проектів
 */

import { Router } from 'express';
import {
  getFeedbacks,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedbackController';
import { verifyAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  getFeedbacksSchema, 
  getFeedbackSchema, 
  createFeedbackSchema, 
  updateFeedbackSchema 
} from '../utils/validation';

const router = Router();

// Всі маршрути фідбеків потребують автентифікації
router.use(verifyAuth);

/**
 * @route   GET /api/feedback/:projectId
 * @desc    Отримання списку фідбеків для проекту
 * @access  Private
 */
router.get('/:projectId', validate(getFeedbacksSchema), getFeedbacks);

/**
 * @route   GET /api/feedback/:projectId/:id
 * @desc    Отримання фідбеку за ID
 * @access  Private
 */
router.get('/:projectId/:id', validate(getFeedbackSchema), getFeedback);

/**
 * @route   POST /api/feedback/:projectId
 * @desc    Створення нового фідбеку
 * @access  Private
 */
router.post('/:projectId', validate(createFeedbackSchema), createFeedback);

/**
 * @route   PUT /api/feedback/:projectId/:id
 * @desc    Оновлення фідбеку
 * @access  Private
 */
router.put('/:projectId/:id', validate(updateFeedbackSchema), updateFeedback);

/**
 * @route   DELETE /api/feedback/:projectId/:id
 * @desc    Видалення фідбеку
 * @access  Private
 */
router.delete('/:projectId/:id', validate(getFeedbackSchema), deleteFeedback);

export default router;