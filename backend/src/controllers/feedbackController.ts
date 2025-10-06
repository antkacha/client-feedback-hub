import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MockAIService } from '../services/aiService';

const prisma = new PrismaClient();

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true
          }
        }
      }
    });

    // Парсимо ШІ-аналіз з JSON
    const feedbacksWithAI = feedbacks.map(feedback => ({
      ...feedback,
      aiAnalysis: feedback.aiAnalysis ? JSON.parse(feedback.aiAnalysis) : null,
      attachments: feedback.attachments ? JSON.parse(feedback.attachments) : null,
      coordinates: feedback.coordinates ? JSON.parse(feedback.coordinates) : null
    }));

    res.json({ success: true, feedbacks: feedbacksWithAI });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні фідбеку'
    });
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      category = 'general',
      severity = 'MEDIUM',
      authorEmail,
      authorName,
      authorId,
      coordinates,
      selector,
      attachments
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Заголовок та опис є обов\'язковими'
      });
    }

    // Перевіряємо існування проекту
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не знайдено'
      });
    }

    // Створюємо фідбек спочатку без ШІ-аналізу
    const feedback = await prisma.feedback.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        projectId,
        authorId: authorId || null,
        authorEmail: authorEmail || null,
        authorName: authorName || null,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        selector: selector || null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        needsAiRegeneration: true // Позначаємо, що потрібен ШІ-аналіз
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true
          }
        }
      }
    });

    // Генеруємо ШІ-аналіз асинхронно
    try {
      const aiAnalysis = await MockAIService.analyzeFeedback({
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        severity: feedback.severity,
        context: {
          projectName: project.name,
          projectDescription: project.description,
          url: project.url || undefined
        }
      });

      // Оновлюємо фідбек з ШІ-аналізом
      await prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          aiAnalysis: JSON.stringify(aiAnalysis),
          needsAiRegeneration: false
        }
      });

      res.status(201).json({
        success: true,
        data: {
          ...feedback,
          aiAnalysis,
          attachments: feedback.attachments ? JSON.parse(feedback.attachments) : null,
          coordinates: feedback.coordinates ? JSON.parse(feedback.coordinates) : null
        },
        message: 'Фідбек успішно створено з ШІ-аналізом'
      });

    } catch (aiError) {
      console.warn('AI analysis failed, but feedback created:', aiError);
      
      res.status(201).json({
        success: true,
        data: {
          ...feedback,
          aiAnalysis: null,
          attachments: feedback.attachments ? JSON.parse(feedback.attachments) : null,
          coordinates: feedback.coordinates ? JSON.parse(feedback.coordinates) : null
        },
        message: 'Фідбек створено, ШІ-аналіз буде додано пізніше'
      });
    }

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні фідбеку'
    });
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, severity, status } = req.body;

    const existingFeedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Фидбек не найден'
      });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(category && { category }),
        ...(severity && { severity }),
        ...(status && { status })
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: feedback,
      message: 'Фидбек успешно обновлен'
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении фидбека'
    });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingFeedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Фідбек не знайдено'
      });
    }

    await prisma.feedback.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Фідбек успішно видалено'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні фідбеку'
    });
  }
};

/**
 * Регенерація ШІ-аналізу для існуючого фідбеку
 */
export const regenerateAiAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true
          }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Фідбек не знайдено'
      });
    }

    // Отримуємо попередній аналіз для контексту
    const previousAnalysis = feedback.aiAnalysis ? JSON.parse(feedback.aiAnalysis) : null;

    // Генеруємо новий ШІ-аналіз
    const aiAnalysis = await MockAIService.regenerateAnalysis(
      {
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        severity: feedback.severity,
        context: {
          projectName: feedback.project.name,
          projectDescription: feedback.project.description,
          url: feedback.project.url || undefined
        }
      },
      {
        previousAnalysis: previousAnalysis || undefined,
        userFeedback: req.body.userFeedback || undefined,
        implementationResults: req.body.implementationResults || undefined
      }
    );

    // Оновлюємо фідбек з новим аналізом
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        aiAnalysis: JSON.stringify(aiAnalysis),
        needsAiRegeneration: false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...updatedFeedback,
        aiAnalysis,
        attachments: updatedFeedback.attachments ? JSON.parse(updatedFeedback.attachments) : null,
        coordinates: updatedFeedback.coordinates ? JSON.parse(updatedFeedback.coordinates) : null
      },
      message: 'ШІ-аналіз успішно регенеровано'
    });

  } catch (error) {
    console.error('Error regenerating AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при регенерації ШІ-аналізу'
    });
  }
};

/**
 * Отримання детальної інформації про окремий фідбек
 */
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true
          }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Фідбек не знайдено'
      });
    }

    res.json({
      success: true,
      data: {
        ...feedback,
        aiAnalysis: feedback.aiAnalysis ? JSON.parse(feedback.aiAnalysis) : null,
        attachments: feedback.attachments ? JSON.parse(feedback.attachments) : null,
        coordinates: feedback.coordinates ? JSON.parse(feedback.coordinates) : null
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні фідбеку'
    });
  }
};