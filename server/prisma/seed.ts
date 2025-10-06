/**
 * Seed скрипт для первинного наповнення бази даних
 * Створює адміністратора та тестові дані
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Основна функція seed
 */
async function main() {
  console.log('🌱 Розпочинаємо seed процес...');

  try {
    // Створюємо адміністратора
    console.log('👤 Створюємо адміністратора...');
    
    const adminEmail = 'admin@clientfeedbackhub.com';
    const adminPassword = 'Admin123!';
    
    // Перевіряємо чи вже існує адмін
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    let adminUser;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: {
            connect: { id: adminRole.id }
          },
        },
      });
      
      console.log(`✅ Адміністратор створений: ${adminEmail}`);
      console.log(`🔑 Пароль: ${adminPassword}`);
    } else {
      adminUser = existingAdmin;
      console.log(`ℹ️  Адміністратор вже існує: ${adminEmail}`);
    }

    // Створюємо тестового користувача
    console.log('👤 Створюємо тестового користувача...');
    
    const testUserEmail = 'test@example.com';
    const testUserPassword = 'Test123!';
    
    const existingTestUser = await prisma.user.findUnique({
      where: { email: testUserEmail },
    });

    let testUser;
    if (!existingTestUser) {
      const hashedPassword = await bcrypt.hash(testUserPassword, 12);
      
      testUser = await prisma.user.create({
        data: {
          email: testUserEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          isActive: true,
        },
      });
      
      console.log(`✅ Тестовий користувач створений: ${testUserEmail}`);
      console.log(`🔑 Пароль: ${testUserPassword}`);
    } else {
      testUser = existingTestUser;
      console.log(`ℹ️  Тестовий користувач вже існує: ${testUserEmail}`);
    }

    // Створюємо тестовий проект
    console.log('📁 Створюємо тестовий проект...');
    
    const existingProject = await prisma.project.findFirst({
      where: { 
        name: 'Demo Project',
        ownerId: testUser.id,
      },
    });

    let testProject;
    if (!existingProject) {
      testProject = await prisma.project.create({
        data: {
          name: 'Demo Project',
          description: 'Це демонстраційний проект для тестування функціоналу Client Feedback Hub',
          websiteUrl: 'https://example.com',
          ownerId: testUser.id,
          settings: {
            allowAnonymousFeedback: true,
            emailNotifications: true,
            feedbackCategories: ['Bug', 'Feature', 'Improvement', 'General'],
            priorities: ['Low', 'Medium', 'High', 'Critical'],
          },
        },
      });
      
      console.log(`✅ Тестовий проект створений: ${testProject.name}`);
    } else {
      testProject = existingProject;
      console.log(`ℹ️  Тестовий проект вже існує: ${existingProject.name}`);
    }

    // Створюємо тестові фідбеки
    console.log('💬 Створюємо тестові фідбеки...');
    
    const feedbacksData = [
      {
        title: 'Кнопка входу не працює на мобільних пристроях',
        description: 'При натисканні на кнопку "Увійти" на iPhone нічого не відбувається. Проблема спостерігається в Safari.',
        priority: 'HIGH',
        category: 'Bug',
        status: 'OPEN',
        position: { x: 150, y: 200 },
        metadata: {
          browser: 'Safari',
          device: 'iPhone 12',
          os: 'iOS 15.0',
          url: '/login',
        },
      },
      {
        title: 'Додати темну тему',
        description: 'Було б чудово мати можливість перемкнутися на темну тему для роботи вночі.',
        priority: 'MEDIUM',
        category: 'Feature',
        status: 'OPEN',
        position: { x: 300, y: 100 },
        metadata: {
          category: 'UI/UX',
          votes: 15,
        },
      },
      {
        title: 'Покращити швидкість завантаження',
        description: 'Сторінка завантажується досить повільно, особливо на повільному інтернеті.',
        priority: 'MEDIUM',
        category: 'Improvement',
        status: 'IN_PROGRESS',
        position: { x: 250, y: 350 },
        metadata: {
          loadTime: '3.2s',
          targetTime: '1.5s',
        },
      },
    ];

    for (const feedbackData of feedbacksData) {
      const existingFeedback = await prisma.feedback.findFirst({
        where: {
          title: feedbackData.title,
          projectId: testProject.id,
        },
      });

      if (!existingFeedback) {
        const feedback = await prisma.feedback.create({
          data: {
            ...feedbackData,
            projectId: testProject.id,
            authorId: testUser.id,
          },
        });
        
        // Додаємо коментар до першого фідбеку
        if (feedbackData.title.includes('кнопка входу')) {
          await prisma.comment.create({
            data: {
              content: 'Перевірив на своєму iPhone - проблема підтверджується. Можливо пов\'язано з новою версією Safari.',
              feedbackId: feedback.id,
              authorId: adminUser.id,
            },
          });
        }
        
        console.log(`✅ Фідбек створений: ${feedbackData.title}`);
      } else {
        console.log(`ℹ️  Фідбек вже існує: ${feedbackData.title}`);
      }
    }

    console.log('🎉 Seed процес завершено успішно!');
    console.log('\n📋 Створені облікові записи:');
    console.log(`   Адміністратор: ${adminEmail} / ${adminPassword}`);
    console.log(`   Тестовий користувач: ${testUserEmail} / ${testUserPassword}`);
    console.log('\n🚀 Можете розпочинати тестування!');

  } catch (error) {
    console.error('❌ Помилка під час seed процесу:', error);
    throw error;
  }
}

/**
 * Запуск seed процесу
 */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });