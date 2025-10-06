import { Router } from 'express';
import aiDesignAnalyzer from '../services/aiDesignAnalyzer';
import {
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  regenerateAiAnalysis,
  getFeedbackById
} from '../controllers/feedbackController';

const router = Router();

// Получение списка фидбеков проекта
router.get('/', getFeedbacks);

// Создание нового фидбека
router.post('/', createFeedback);

// ШІ аналіз фідбеку
router.post('/analyze', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Контент фідбеку обов\'язковий'
      });
    }

    // Аналізуємо фідбек через ШІ
    const analysis = await aiDesignAnalyzer.analyzeFeedback(content);

    res.json({
      success: true,
      message: 'Фідбек проаналізовано',
      data: {
        originalContent: content,
        aiAnalysis: analysis
      }
    });

  } catch (error) {
    console.error('Помилка ШІ аналізу:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при аналізі фідбеку'
    });
  }
});

// Отримання рекомендацій для дизайну
router.post('/recommendations', async (req, res) => {
  try {
    const { category, projectType } = req.body;

    const recommendations = await aiDesignAnalyzer.generateDesignRecommendations(
      category || 'UX', 
      projectType || 'web'
    );

    res.json({
      success: true,
      data: {
        category,
        projectType,
        recommendations
      }
    });

  } catch (error) {
    console.error('Помилка генерації рекомендацій:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при генерації рекомендацій'
    });
  }
});

// Аналіз доступності
router.post('/accessibility-check', async (req, res) => {
  try {
    const { description } = req.body;

    const accessibilityReport = await aiDesignAnalyzer.evaluateAccessibility(
      description || 'Загальна перевірка доступності'
    );

    res.json({
      success: true,
      data: accessibilityReport
    });

  } catch (error) {
    console.error('Помилка аналізу доступності:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при аналізі доступності'
    });
  }
});

// Статистика ШІ аналізів
router.get('/ai-stats', (req, res) => {
  try {
    const stats = aiDesignAnalyzer.getAnalyticsStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Помилка отримання статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні статистики'
    });
  }
});

// Отримання фідбеку за ID
router.get('/:id', getFeedbackById);

// Регенерація ШІ-аналізу для конкретного фідбеку
router.post('/:id/regenerate-ai', regenerateAiAnalysis);

// Обновление статуса фидбека
router.put('/:id', updateFeedback);

// Удаление фидбека
router.delete('/:id', deleteFeedback);

// Завантаження прикріплення до фідбеку
router.post('/:id/attachments', (req, res) => {
  res.json({
    success: true,
    message: `Завантаження файлу до фідбеку ${req.params.id} - TODO: реалізувати контролер`
  });
});

export default router;