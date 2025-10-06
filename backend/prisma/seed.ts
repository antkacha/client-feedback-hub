import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Заповнення бази даних початковими даними...');

  // Створення адміністратора за замовчуванням
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cfh.local' },
    update: {},
    create: {
      email: 'admin@cfh.local',
      password: adminPassword,
      firstName: 'Адмін',
      lastName: 'Системи',
      role: 'ADMIN',
      isActive: true
    }
  });

  // Створення тестового менеджера
  const managerPassword = await bcrypt.hash('manager123', 12);
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@cfh.local' },
    update: {},
    create: {
      email: 'manager@cfh.local',
      password: managerPassword,
      firstName: 'Менеджер',
      lastName: 'Тестовий',
      role: 'MANAGER',
      isActive: true
    }
  });

  // Створення тестового користувача
  const userPassword = await bcrypt.hash('user123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@cfh.local' },
    update: {},
    create: {
      email: 'user@cfh.local',
      password: userPassword,
      firstName: 'Користувач',
      lastName: 'Тестовий',
      role: 'USER',
      isActive: true
    }
  });

  // Створення тестових проєктів
  const project1 = await prisma.project.upsert({
    where: { id: 'startup-landing' },
    update: {},
    create: {
      id: 'startup-landing',
      name: '🌟 Landing Page для Стартапу',
      description: 'Сучасний лендінг для AI стартапу з градієнтами та анімаціями. Потрібен аудит UX та оптимізація конверсії.',
      url: 'https://ai-startup.example.com',
      ownerId: manager.id,
      isActive: true
    }
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'mobile-app-ui' },
    update: {},
    create: {
      id: 'mobile-app-ui',
      name: '📱 Мобільний Додаток для Фітнесу',
      description: 'Дизайн iOS/Android додатку для тренувань. Фокус на користувацькому досвіді та accessibility.',
      url: 'https://fitness-app.example.com',
      ownerId: admin.id,
      isActive: true
    }
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'ecommerce-redesign' },
    update: {},
    create: {
      id: 'ecommerce-redesign',
      name: '🛒 Редизайн Інтернет-магазину',
      description: 'Повний редизайн e-commerce платформи. Потрібна перевірка checkout процесу та навігації.',
      url: 'https://shop.example.com',
      ownerId: user.id,
      isActive: true
    }
  });

  const project4 = await prisma.project.upsert({
    where: { id: 'dashboard-analytics' },
    update: {},
    create: {
      id: 'dashboard-analytics',
      name: '📊 Дашборд для Аналітики',
      description: 'Комплексна панель керування з графіками та метриками. Потрібна оптимізація інформаційної архітектури.',
      url: 'https://analytics.example.com',
      ownerId: manager.id,
      isActive: true
    }
  });

  const project5 = await prisma.project.upsert({
    where: { id: 'design-system' },
    update: {},
    create: {
      id: 'design-system',
      name: '🎨 Корпоративна Дизайн-система',
      description: 'Створення цілісної design system для великої компанії. Компоненти, токени, документація.',
      url: 'https://design-system.example.com',
      ownerId: admin.id,
      isActive: true
    }
  });

  // Створення тестових фідбеків для різних проєктів
  await prisma.feedback.createMany({
    data: [
      // Фідбеки для стартап лендінга
      {
        title: '🎨 Кольорова схема занадто яскрава',
        description: 'Градієнт на hero секції дуже контрастний, важко читати текст. Рекомендую зробити більш м\'які переходи кольорів.',
        severity: 'MEDIUM',
        status: 'OPEN',
        projectId: project1.id,
        authorEmail: 'designer@studio.com',
        authorName: 'Анна Дизайнер',
        category: 'color'
      },
      {
        title: '🔤 Проблеми з типографікою на мобільних',
        description: 'Заголовки H1 занадто великі на екранах до 768px. Також line-height потрібно збільшити для кращої читабельності.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        projectId: project1.id,
        authorEmail: 'mobile.expert@ux.com',
        authorName: 'Максим UX',
        category: 'typography'
      },
      
      // Фідбеки для мобільного додатку
      {
        title: '♿ Accessibility проблеми з контрастом',
        description: 'Кнопки не проходять WCAG AA стандарт. Контраст тексту на кнопках менше 4.5:1.',
        severity: 'HIGH',
        status: 'OPEN',
        projectId: project2.id,
        authorEmail: 'a11y@expert.com',
        authorName: 'Олена Доступність',
        category: 'accessibility'
      },
      {
        title: '👤 UX навігації потребує покращення',
        description: 'Користувачі плутаються в структурі меню. Tab bar містить занадто багато пунктів. Рекомендую групування.',
        severity: 'MEDIUM',
        status: 'OPEN',
        projectId: project2.id,
        authorEmail: 'user.researcher@test.com',
        authorName: 'Дмитро Дослідник',
        category: 'ux'
      },
      
      // Фідбеки для інтернет-магазину
      {
        title: '📐 Композиція продуктової сторінки',
        description: 'Занадто багато елементів конкурують за увагу. Потрібна чітка візуальна ієрархія та більше білого простору.',
        severity: 'MEDIUM',
        status: 'RESOLVED',
        projectId: project3.id,
        authorEmail: 'layout@expert.com',
        authorName: 'Ірина Композиція',
        category: 'layout'
      },
      {
        title: '🏷️ Брендинг не консистентний',
        description: 'Логотип використовується в різних варіаціях. Потрібні чіткі гайдлайни по використанню бренд-елементів.',
        severity: 'LOW',
        status: 'IN_PROGRESS',
        projectId: project3.id,
        authorEmail: 'brand@manager.com',
        authorName: 'Сергій Бренд',
        category: 'branding'
      },
      
      // Фідбеки для дашборду
      {
        title: '📊 Інформаційна перевantажеsність',
        description: 'На головному екрані занадто багато метрик одночасно. Користувачі не знають, на що дивитися в першу чергу.',
        severity: 'HIGH',
        status: 'OPEN',
        projectId: project4.id,
        authorEmail: 'data.viz@analyst.com',
        authorName: 'Катерина Аналітик',
        category: 'ux'
      },
      
      // Фідбеки для дизайн-системи
      {
        title: '🎨 Компоненти потребують стандартизації',
        description: 'Кнопки мають різні border-radius в різних секціях. Потрібна централізована система токенів.',
        severity: 'MEDIUM',
        status: 'OPEN',
        projectId: project5.id,
        authorEmail: 'system@designer.com',
        authorName: 'Віктор Система',
        category: 'general'
      }
    ]
  });

  console.log('✅ База даних успішно заповнена!');
  console.log('📋 Створені облікові записи:');
  console.log(`   👤 Адмін: admin@cfh.local / admin123`);
  console.log(`   👤 Менеджер: manager@cfh.local / manager123`);
  console.log(`   👤 Користувач: user@cfh.local / user123`);
  console.log(`   📁 Проєкти: 5 різноманітних дизайн-проєктів`);
  console.log(`   💬 Фідбеки: 9 тестових записів з різними категоріями`);
}

main()
  .catch((e) => {
    console.error('❌ Помилка заповнення бази даних:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });