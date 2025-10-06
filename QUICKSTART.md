# Швидкий старт Client Feedback Hub

Цей скрипт допоможе швидко налаштувати та запустити проєкт локально.

## Передумови

Переконайтеся, що у вас встановлено:
- Node.js 18+ 
- PostgreSQL 14+
- npm або yarn
- Docker (опціонально)

## Автоматичне налаштування

Запустіть скрипт швидкого старту:

```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

Або виконайте кроки вручну:

## Ручне налаштування

### 1. Клонування та встановлення залежностей

```bash
# Клонуйте репозиторій
git clone https://github.com/yourusername/client-feedback-hub.git
cd client-feedback-hub

# Встановіть залежності для всього проєкту
npm install

# Встановіть залежності для backend
cd backend
npm install

# Встановіть залежності для frontend
cd ../frontend
npm install
cd ..
```

### 2. Налаштування бази даних

```bash
# Створіть базу даних PostgreSQL
createdb client_feedback_hub

# Або через psql:
psql -c "CREATE DATABASE client_feedback_hub;"
```

### 3. Налаштування змінних середовища

```bash
# Backend
cp backend/.env.example backend/.env
# Відредагуйте backend/.env з вашими налаштуваннями

# Frontend  
cp frontend/.env.example frontend/.env
# Відредагуйте frontend/.env з вашими налаштуваннями
```

### 4. Запуск міграцій та seed

```bash
cd backend
npm run db:setup
cd ..
```

### 5. Запуск проєкту

```bash
# Розробка (frontend + backend одночасно)
npm run dev

# Або окремо:
npm run dev:backend  # Backend на порту 3001
npm run dev:frontend # Frontend на порту 5173
```

## Доступні URL

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## Тестові облікові записи

Після запуску seed будуть доступні:

- **Адмін**: admin@cfh.local / admin123
- **Менеджер**: manager@cfh.local / manager123  
- **Користувач**: user@cfh.local / user123

## Корисні команди

```bash
# Лінтинг
npm run lint
npm run lint:fix

# Тести
npm run test

# Збірка
npm run build

# База даних
cd backend
npm run db:studio    # Prisma Studio
npm run db:migrate   # Нові міграції
npm run db:seed      # Заповнення даними
```

## Docker (альтернативний спосіб)

```bash
# Запуск через Docker Compose
docker-compose up --build

# Тільки база даних
docker-compose up postgres
```

## Структура проєкту

```
client-feedback-hub/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── public/
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── types/
│   └── prisma/
└── .github/workflows/ # CI/CD
```

## Розробка

### Гарячі клавіші в VS Code

- `Ctrl+Shift+P` → "Client Feedback Hub: Start Dev"
- `Ctrl+Shift+P` → "Client Feedback Hub: Run Tests"

### Git workflow

```bash
# Створіть нову гілку для функції
git checkout -b feature/your-feature

# Зробіть коміти (husky перевірить код)
git add .
git commit -m "feat: додано нову функцію"

# Відправте PR
git push origin feature/your-feature
```

### Налагодження

- Backend: http://localhost:3001 + VS Code debugger
- Frontend: React DevTools + React Query DevTools
- Database: Prisma Studio → `npm run db:studio`

## Поширені проблеми

### Помилка підключення до БД
```bash
# Перевірте чи запущений PostgreSQL
sudo service postgresql status

# Перевірте налаштування в .env
DATABASE_URL="postgresql://username:password@localhost:5432/client_feedback_hub"
```

### Порти зайняті
```bash
# Знайдіть процеси на портах 3001, 5173
lsof -i :3001
lsof -i :5173

# Вбийте процеси
kill -9 <PID>
```

### Помилки TypeScript
```bash
# Очистіть кеш та перебудуйте
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Документація API

Після запуску сервера доступна за адресою:
http://localhost:3001/api-docs

## Підтримка

- GitHub Issues: https://github.com/yourusername/client-feedback-hub/issues
- Email: support@clientfeedbackhub.com
- Discord: https://discord.gg/cfh

---

Успішної розробки! 🚀