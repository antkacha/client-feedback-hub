import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import {
  getFeedbacks,
  createFeedback
} from '../controllers/feedbackController';

const router = Router();

// Получение списка проектов
router.get('/', getProjects);

// Создание нового проекта
router.post('/', createProject);

// Получение проекта по ID
router.get('/:id', getProjectById);

// Обновление проекта
router.put('/:id', updateProject);

// Удаление проекта
router.delete('/:id', deleteProject);

// Получение фидбеков проекта
router.get('/:projectId/feedbacks', getFeedbacks);

// Добавление фидбека к проекту
router.post('/:projectId/feedbacks', createFeedback);

export default router;