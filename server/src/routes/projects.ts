/**
 * Маршрути для управління проектами
 * CRUD операції для проектів
 */

import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { verifyAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  getProjectsSchema, 
  getProjectSchema, 
  createProjectSchema, 
  updateProjectSchema 
} from '../utils/validation';

const router = Router();

// Всі маршрути проектів потребують автентифікації
router.use(verifyAuth);

/**
 * @route   GET /api/projects
 * @desc    Отримання списку проектів користувача
 * @access  Private
 */
router.get('/', validate(getProjectsSchema), getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Отримання проекту за ID
 * @access  Private
 */
router.get('/:id', validate(getProjectSchema), getProject);

/**
 * @route   POST /api/projects
 * @desc    Створення нового проекту
 * @access  Private
 */
router.post('/', validate(createProjectSchema), createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Оновлення проекту
 * @access  Private (тільки власник)
 */
router.put('/:id', validate(updateProjectSchema), updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Видалення проекту
 * @access  Private (тільки власник)
 */
router.delete('/:id', validate(getProjectSchema), deleteProject);

export default router;