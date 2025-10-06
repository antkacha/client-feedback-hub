import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Отримання списку проєктів...');
    
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`✅ Знайдено ${projects.length} проєктів`);
    res.json(projects);
  } catch (error) {
    console.error('❌ Помилка при отриманні проєктів:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні списку проєктів'
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        feedbacks: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении проекта'
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, ownerId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Название проекта обязательно'
      });
    }

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'ID владельца проекта обязательно'
      });
    }

    // Для демо используем тестового пользователя
    const testUserId = 'cmfycp3g40002zxdqs265scmu' // ID из seed данных
    
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        ownerId: ownerId || testUserId
      }
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Проект успешно создан'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании проекта'
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null })
      }
    });

    res.json({
      success: true,
      data: project,
      message: 'Проект успешно обновлен'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении проекта'
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Проект успешно удален'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении проекта'
    });
  }
};