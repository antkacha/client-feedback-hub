# Client Feedback Hub (CFH)

Багатосторінковий SaaS додаток для збору та управління відгуками клієнтів у стилі BugHerd.

## 🚀 Швидкий старт

### Передумови
- Node.js 18+
- PostgreSQL 14+
- npm або yarn

### Встановлення

1. Клонуйте репозиторій:
```bash
git clone https://github.com/yourusername/client-feedback-hub.git
cd client-feedback-hub
```

2. Встановіть залежності:
```bash
npm install
```

3. Налаштуйте змінні середовища:
```bash
# Backend
cp backend/.env.example backend/.env
# Відредагуйте backend/.env з вашими налаштуваннями

# Frontend
cp frontend/.env.example frontend/.env
# Відредагуйте frontend/.env з вашими налаштуваннями
```

4. Запустіть базу даних та міграції:
```bash
cd backend
npm run db:setup
```

5. Запустіть проєкт в режимі розробки:
```bash
npm run dev
```

Додаток буде доступний за адресою:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Структура проєкту

```
client-feedback-hub/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Переваживамі компоненти
│   │   ├── pages/           # Сторінки додатку
│   │   ├── hooks/           # React хуки
│   │   ├── services/        # API сервіси
│   │   ├── store/           # Стан додатку
│   │   ├── types/           # TypeScript типи
│   │   └── utils/           # Утиліти
│   └── public/              # Статичні файли
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Контролери API
│   │   ├── routes/          # Маршрути API
│   │   ├── middleware/      # Middleware
│   │   ├── services/        # Бізнес логіка
│   │   ├── types/           # TypeScript типи
│   │   └── utils/           # Утиліти
│   ├── prisma/              # Схема бази даних та міграції
│   └── tests/               # Тести
└── .github/workflows/       # GitHub Actions CI/CD
```

## 🛠 Технологічний стек

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Testing**: React Testing Library + Jest

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Testing**: Jest + Supertest

### DevOps
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose

## 📋 Функціонал

### Основні можливості
- ✅ Автентифікація користувачів (реєстрація/вхід)
- ✅ Управління проєктами (CRUD)
- ✅ Система відгуків з прикріпленнями
- ✅ Pin tool для позначення місць на зображеннях
- ✅ Рольова модель доступу (User/Manager/Admin)
- ✅ Адмін панель
- ✅ Профіль користувача

### Сторінки додатку
1. `/` - Лендінг сторінка
2. `/auth/login` - Вхід в систему
3. `/auth/register` - Реєстрація
4. `/dashboard` - Дашборд з проєктами
5. `/projects/:id` - Дошка відгуків проєкту
6. `/projects/:id/feedback/new` - Створення відгуку
7. `/admin` - Адмін панель
8. `/profile` - Налаштування профілю

## 📖 Документація

- [Швидкий старт](./QUICKSTART.md) - Детальні інструкції з налаштування
- [API документація](./API_DOCS.md) - Повний опис API endpoints
- [Архітектура системи](./ARCHITECTURE.md) - Технічна архітектура проєкту

## 🛠️ Скрипти автоматизації

Проєкт включає готові скрипти для автоматизації процесів розробки:

### Швидке налаштування
```bash
# Автоматичне налаштування всього проєкту
./setup-dev.sh

# Або через npm
npm run setup
```

### Тестування
```bash
# Запуск всіх тестів та перевірок
./test-all.sh

# Тестування окремих компонентів
./test-all.sh backend frontend
./test-all.sh security

# Або через npm
npm run test:all
```

### Деплой
```bash
# Локальний деплой
./deploy.sh deploy local
npm run deploy:local

# Staging деплой
./deploy.sh deploy staging  
npm run deploy:staging

# Перевірка статусу
./deploy.sh status
npm run deploy:status

# Перегляд логів
./deploy.sh logs
npm run deploy:logs
```

## 🧪 Тестування

```bash
# Всі тести
npm run test

# Тільки frontend
npm run test:frontend

# Тільки backend
npm run test:backend
```

## 🚀 Деплой

### Розробка
```bash
npm run dev
```

### Продакшн збірка
```bash
npm run build
```

### Docker
```bash
docker-compose up --build
```

## 🤝 Внесок в проєкт

1. Форкніть репозиторій
2. Створіть гілку для нової функції (`git checkout -b feature/amazing-feature`)
3. Зробіть коміт змін (`git commit -m 'Додано нову функцію'`)
4. Запушіть в гілку (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

Цей проєкт ліцензовано під MIT ліцензією - дивіться файл [LICENSE](LICENSE) для деталей.

## 📞 Підтримка

Якщо у вас є питання або проблеми:
- Створіть [Issue](https://github.com/yourusername/client-feedback-hub/issues)
- Напишіть на email: support@clientfeedbackhub.com

---

Зроблено з ❤️ для кращого збору відгуків клієнтів