/**
 * Тестовий скрипт для перевірки локального flow:
 * register → create project → create feedback
 * 
 * Запуск: npm run test:flow або node -r ts-node/register test-flow.ts
 */

import axios, { AxiosError } from 'axios';

// Базова конфігурація для тестів
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Тест',
  lastName: 'Користувач',
};

// Створюємо axios інстанцію
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  validateStatus: () => true, // Не кидаємо помилки на HTTP статуси
});

/**
 * Допоміжна функція для логування
 */
function log(message: string, data?: any) {
  console.log(`🔄 ${message}`);
  if (data) {
    console.log('   Дані:', JSON.stringify(data, null, 2));
  }
}

/**
 * Допоміжна функція для обробки помилок
 */
function handleError(error: AxiosError | Error, step: string) {
  console.error(`❌ Помилка в кроці "${step}":`, error.message);
  if (axios.isAxiosError(error) && error.response) {
    console.error('   Статус:', error.response.status);
    console.error('   Дані відповіді:', error.response.data);
  }
  process.exit(1);
}

/**
 * Основна функція тестування
 */
async function testLocalFlow() {
  let accessToken = '';
  let projectId = '';
  let feedbackId = '';

  console.log('🚀 Починаємо тестування локального flow...\n');

  try {
    // 1. Реєстрація користувача
    log('Крок 1: Реєстрація користувача', TEST_USER);
    const registerResponse = await api.post('/auth/register', TEST_USER);
    
    if (registerResponse.status !== 201) {
      throw new Error(`Очікувався статус 201, отримали ${registerResponse.status}`);
    }

    const { user, accessToken: token } = registerResponse.data.data;
    accessToken = token;
    
    console.log('✅ Користувач успішно зареєстрований');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Токен: ${accessToken.substring(0, 20)}...`);

    // Встановлюємо токен для подальших запитів
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // 2. Створення проекту
    log('Крок 2: Створення проекту');
    const projectData = {
      name: 'Тестовий проект',
      description: 'Проект для тестування локального flow',
      url: 'https://test-project.example.com',
    };

    const createProjectResponse = await api.post('/projects', projectData);
    
    if (createProjectResponse.status !== 201) {
      throw new Error(`Очікувався статус 201, отримали ${createProjectResponse.status}`);
    }

    const project = createProjectResponse.data.data;
    projectId = project.id;
    
    console.log('✅ Проект успішно створено');
    console.log(`   ID: ${project.id}`);
    console.log(`   Назва: ${project.name}`);
    console.log(`   Опис: ${project.description}`);

    // 3. Створення feedback
    log('Крок 3: Створення feedback');
    const feedbackData = {
      title: 'Тестовий feedback',
      description: 'Це тестовий feedback для перевірки роботи системи. Тут описується проблема або пропозиція.',
      priority: 'MEDIUM',
      category: 'bug',
      pageUrl: 'https://test-project.example.com/page1',
      browserInfo: 'Chrome 120.0.0.0 on macOS',
    };

    const createFeedbackResponse = await api.post(`/projects/${projectId}/feedback`, feedbackData);
    
    if (createFeedbackResponse.status !== 201) {
      throw new Error(`Очікувався статус 201, отримали ${createFeedbackResponse.status}`);
    }

    const feedback = createFeedbackResponse.data.data;
    feedbackId = feedback.id;
    
    console.log('✅ Feedback успішно створено');
    console.log(`   ID: ${feedback.id}`);
    console.log(`   Заголовок: ${feedback.title}`);
    console.log(`   Статус: ${feedback.status}`);
    console.log(`   Пріоритет: ${feedback.priority}`);

    // 4. Отримання списку feedback для проекту
    log('Крок 4: Отримання списку feedback');
    const getFeedbackResponse = await api.get(`/projects/${projectId}/feedback`);
    
    if (getFeedbackResponse.status !== 200) {
      throw new Error(`Очікувався статус 200, отримали ${getFeedbackResponse.status}`);
    }

    const feedbackList = getFeedbackResponse.data.data;
    
    console.log('✅ Список feedback успішно отримано');
    console.log(`   Кількість: ${feedbackList.data.length}`);
    console.log(`   Пагінація: сторінка ${feedbackList.pagination.page} з ${feedbackList.pagination.totalPages}`);

    // 5. Отримання деталей feedback
    log('Крок 5: Отримання деталей feedback');
    const getFeedbackDetailsResponse = await api.get(`/feedback/${feedbackId}`);
    
    if (getFeedbackDetailsResponse.status !== 200) {
      throw new Error(`Очікувався статус 200, отримали ${getFeedbackDetailsResponse.status}`);
    }

    const feedbackDetails = getFeedbackDetailsResponse.data.data;
    
    console.log('✅ Деталі feedback успішно отримано');
    console.log(`   ID: ${feedbackDetails.id}`);
    console.log(`   Заголовок: ${feedbackDetails.title}`);
    console.log(`   Створено: ${feedbackDetails.createdAt}`);

    // 6. Оновлення статусу feedback
    log('Крок 6: Оновлення статусу feedback');
    const updateFeedbackResponse = await api.put(`/feedback/${feedbackId}`, {
      status: 'IN_PROGRESS',
    });
    
    if (updateFeedbackResponse.status !== 200) {
      throw new Error(`Очікувався статус 200, отримали ${updateFeedbackResponse.status}`);
    }

    const updatedFeedback = updateFeedbackResponse.data.data;
    
    console.log('✅ Статус feedback успішно оновлено');
    console.log(`   Новий статус: ${updatedFeedback.status}`);

    // 7. Створення коментаря
    log('Крок 7: Створення коментаря');
    const commentData = {
      content: 'Це тестовий коментар до feedback. Дякую за звіт!',
    };

    const createCommentResponse = await api.post(`/feedback/${feedbackId}/comments`, commentData);
    
    if (createCommentResponse.status !== 201) {
      throw new Error(`Очікувався статус 201, отримали ${createCommentResponse.status}`);
    }

    const comment = createCommentResponse.data.data;
    
    console.log('✅ Коментар успішно створено');
    console.log(`   ID: ${comment.id}`);
    console.log(`   Текст: ${comment.content}`);

    // 8. Отримання коментарів
    log('Крок 8: Отримання коментарів');
    const getCommentsResponse = await api.get(`/feedback/${feedbackId}/comments`);
    
    if (getCommentsResponse.status !== 200) {
      throw new Error(`Очікувався статус 200, отримали ${getCommentsResponse.status}`);
    }

    const comments = getCommentsResponse.data.data;
    
    console.log('✅ Коментарі успішно отримано');
    console.log(`   Кількість: ${comments.length}`);

    // Фінальне повідомлення
    console.log('\n🎉 Усі тести пройшли успішно!');
    console.log('📋 Підсумок:');
    console.log(`   • Користувач зареєстрований: ${user.email}`);
    console.log(`   • Проект створено: ${project.name} (ID: ${projectId})`);
    console.log(`   • Feedback створено: ${feedback.title} (ID: ${feedbackId})`);
    console.log(`   • Коментар додано: ${comment.content.substring(0, 30)}...`);
    console.log('\n✨ Локальний flow працює коректно!');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      handleError(error, 'HTTP запит');
    } else {
      handleError(error as Error, 'Загальна помилка');
    }
  }
}

/**
 * Функція для перевірки доступності сервера
 */
async function checkServerHealth() {
  try {
    log('Перевірка доступності сервера...');
    const response = await api.get('/health', {
      baseURL: 'http://localhost:5000', // без /api
    });
    
    if (response.status === 200) {
      console.log('✅ Сервер доступний');
      console.log('   Статус:', response.data.status);
      console.log('   Середовище:', response.data.environment);
      return true;
    } else {
      console.log(`❌ Сервер недоступний (статус: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log('❌ Не вдалося з\'єднатися з сервером');
    console.log('   Перевірте що сервер запущений на http://localhost:5000');
    return false;
  }
}

/**
 * Головна функція
 */
async function main() {
  console.log('🧪 Тестування Client Feedback Hub API\n');

  // Перевіряємо доступність сервера
  const serverAvailable = await checkServerHealth();
  if (!serverAvailable) {
    console.log('\n💡 Для запуску сервера виконайте:');
    console.log('   cd server && npm run dev');
    process.exit(1);
  }

  console.log(); // Порожній рядок для кращого форматування

  // Запускаємо основні тести
  await testLocalFlow();
}

// Запускаємо тести
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Критична помилка:', error);
    process.exit(1);
  });
}

export { testLocalFlow, checkServerHealth };