# Client Feedback Hub - Backend

Backend для системи збору відгуків клієнтів на Node.js + Express + TypeScript + Prisma.

## � Швидкий старт

```bash
# Встановлення залежностей
npm install

# Налаштування бази даних
npm run db:migrate
npm run db:seed

# Запуск сервера
npm run dev
```

Сервер буде доступний на `http://localhost:3001`

## ⚙️ Налаштування

Створіть файл `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-jwt-secret"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## � Основні API endpoints

- `POST /api/auth/login` - Вхід
- `POST /api/auth/register` - Реєстрація  
- `GET /api/projects` - Список проектів
- `POST /api/projects` - Створити проект
- `GET /api/feedback/:projectId` - Фідбеки проекту
- `POST /api/feedback/:projectId` - Новий фідбек

## � Тестові акаунти

- **admin@cfh.local** / admin123
- **manager@cfh.local** / manager123  
- **user@cfh.local** / user123







