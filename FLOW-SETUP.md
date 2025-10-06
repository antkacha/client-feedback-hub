# Client Feedback Hub - Локальний Flow

Цей документ описує як налаштувати та запустити повний локальний flow для тестування інтеграції frontend та backend.

## 🚀 Швидкий старт

### 1. Backend (сервер)

```bash
# Перейти в папку серверу
cd server

# Встановити залежності
npm install

# Налаштувати базу даних
npm run db:generate
npm run db:push
npm run db:seed

# Запустити сервер в режимі розробки
npm run dev
```

Сервер буде доступний на `http://localhost:5000`

### 2. Frontend (клієнтська частина)

```bash
# Перейти в папку frontend
cd frontend

# Встановити залежності
npm install

# Запустити в режимі розробки
npm run dev
```

Frontend буде доступний на `http://localhost:5173`

### 3. Тестування API (опціонально)

```bash
# З кореневої папки проекту
npm install -g ts-node
npx ts-node test-flow.ts
```

## 📋 Структура проекту

```
client-feedback-hub/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── services/        # Axios сервіси
│   │   │   ├── api.ts       # Базовий API клієнт
│   │   │   ├── authService.ts
│   │   │   ├── projectService.ts
│   │   │   └── feedbackService.ts
│   │   ├── types/           # TypeScript типи
│   │   └── ...
│   └── package.json
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/          # API маршрути
│   │   ├── controllers/     # Контролери
│   │   ├── middleware/      # Middleware
│   │   ├── utils/           # Утиліти
│   │   └── docs/           # API документація
│   ├── prisma/             # Призма схема та міграції
│   └── package.json
└── test-flow.ts            # Тестовий скрипт
```

## 🔗 API Endpoints

### Автентифікація
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Вхід
- `POST /api/auth/logout` - Вихід
- `POST /api/auth/refresh` - Оновлення токену
- `GET /api/auth/me` - Поточний користувач

### Проекти
- `GET /api/projects` - Список проектів
- `POST /api/projects` - Створити проект
- `GET /api/projects/:id` - Деталі проекту
- `PUT /api/projects/:id` - Оновити проект
- `DELETE /api/projects/:id` - Видалити проект

### Feedback
- `GET /api/projects/:id/feedback` - Список feedback проекту
- `POST /api/projects/:id/feedback` - Створити feedback
- `GET /api/feedback/:id` - Деталі feedback
- `PUT /api/feedback/:id` - Оновити feedback
- `DELETE /api/feedback/:id` - Видалити feedback

### Коментарі
- `GET /api/feedback/:id/comments` - Коментарі до feedback
- `POST /api/feedback/:id/comments` - Створити коментар
- `DELETE /api/comments/:id` - Видалити коментар

## 🧪 Тестовий Flow

Автоматичний тест перевіряє наступний сценарій:

1. **Реєстрація користувача** → отримання access token
2. **Створення проекту** → отримання project ID
3. **Створення feedback** → отримання feedback ID  
4. **Отримання списку feedback** → перевірка пагінації
5. **Отримання деталей feedback** → перевірка даних
6. **Оновлення статусу** → зміна статусу на "IN_PROGRESS"
7. **Створення коментаря** → додавання коментаря
8. **Отримання коментарів** → перевірка списку

### Запуск тесту

```bash
# Переконайтеся що сервер запущений
cd server && npm run dev

# В новому терміналі запустіть тест
npx ts-node test-flow.ts
```

Очікуваний результат:
```
🧪 Тестування Client Feedback Hub API

🔄 Перевірка доступності сервера...
✅ Сервер доступний

🚀 Починаємо тестування локального flow...

✅ Користувач успішно зареєстрований
✅ Проект успішно створено
✅ Feedback успішно створено
✅ Список feedback успішно отримано
✅ Деталі feedback успішно отримано
✅ Статус feedback успішно оновлено
✅ Коментар успішно створено
✅ Коментарі успішно отримано

🎉 Усі тести пройшли успішно!
✨ Локальний flow працює коректно!
```

## 📖 API Документація

Коли backend запущений в режимі розробки, Swagger документація доступна на:
`http://localhost:5000/api/docs`

## 🔧 Налаштування

### Backend (.env)

Створіть файл `server/.env` на основі `server/.env.example`:

```env
# База даних
DATABASE_URL="postgresql://username:password@localhost:5432/client_feedback_hub"

# JWT секрети
JWT_ACCESS_SECRET="your-super-secret-access-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Сервер
PORT=5000
NODE_ENV=development

# Frontend URL (для CORS)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

Створіть файл `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚨 Типові проблеми

### 1. Backend не запускається
- Перевірте чи створено `.env` файл
- Перевірте підключення до бази даних
- Запустіть `npm run db:push` для створення таблиць

### 2. Frontend не може з'єднатися з backend
- Перевірте чи запущений backend на порту 5000
- Перевірте CORS налаштування в `server/src/app.ts`
- Перевірте змінну `VITE_API_BASE_URL` в frontend

### 3. Помилки автентифікації
- Перевірте JWT секрети в `.env`
- Очистіть localStorage в браузері
- Перевірте чи встановлені правильні cookies

### 4. Помилки Prisma
```bash
# Скинути базу даних та пересоздати
npm run db:reset
npm run db:push
npm run db:seed
```

## 📝 Структура відповідей API

Всі API відповіді мають єдиний формат:

```typescript
{
  success: boolean;
  data?: any;           // Дані відповіді
  error?: {             // Інформація про помилку (якщо є)
    code: string;
    message: string;
    details?: any;
  };
}
```

### Приклад успішної відповіді:
```json
{
  "success": true,
  "data": {
    "id": "prj_1234567890",
    "name": "Мій проект",
    "description": "Опис проекту"
  }
}
```

### Приклад помилки:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Невірні дані запиту",
    "details": {
      "name": "Поле обов'язкове"
    }
  }
}
```

## 🔒 Автентифікація

Система використовує JWT токени з двома рівнями:

1. **Access Token** - короткотерміновий (15 хвилин), зберігається в localStorage
2. **Refresh Token** - довготерміновий (7 днів), зберігається в httpOnly cookie

### Процес автентифікації:

1. Користувач логінується → отримує обидва токени
2. Access token надсилається в Authorization header: `Bearer <token>`
3. При закінченні access token → автоматичне оновлення через refresh token
4. Refresh token зберігається в безпечному httpOnly cookie

## 🎭 Mock дані

Для розробки frontend використовуються mock дані:

- **Користувачі**: Тестові користувачі з різними ролями
- **Проекти**: 5 демонстраційних проектів
- **Feedback**: Приклади різних типів feedback
- **Коментарі**: Демонстраційні коментарі

Mock дані автоматично генеруються при запуску `npm run db:seed`.

## 📊 Моніторинг

### Health Check
`GET /health` - статус серверу та базових сервісів

### Логування
- Всі HTTP запити логуються через Morgan
- Кастомне логування важливих операцій
- Помилки логуються з повним stack trace

---

**Готовий до розробки! 🚀**

Якщо виникають питання або проблеми, перевірте логи сервера та браузера для додаткової інформації.