# Client Feedback Hub - Frontend

Сучасний React-додаток для збору та управління відгуками у стилі BugHerd. Побудований з використанням найкращих практик розробки та сучасних технологій.

## 🚀 Особливості

- **Сучасний Stack**: React 18, TypeScript, Vite
- **Роутинг**: React Router v6 з lazy loading
- **Стан**: Zustand для глобального стану + React Query для server state
- **Стилізація**: TailwindCSS з кастомною колірною палітрою у стилі BugHerd
- **Форми**: React Hook Form + Zod для валідації
- **Accessibility**: Повна підтримка accessibility (ARIA, focus management)
- **Респонсивність**: Адаптивний дизайн для всіх пристроїв
- **Візуальний збір відгуків**: Інтерактивний інструмент для збору відгуків прямо на сторінці

## 📁 Структура проекту

```
frontend/
├── public/                    # Статичні файли
├── src/
│   ├── components/           # React компоненти
│   │   ├── layout/          # Layout компоненти (Header, Sidebar, etc.)
│   │   └── ui/              # Переважні UI компоненти
│   ├── pages/               # Сторінки додатку
│   ├── hooks/               # Кастомні React хуки та API хуки
│   ├── lib/                 # Утиліти та конфігурації
│   ├── types/               # TypeScript типи
│   ├── styles/              # Глобальні стилі
│   └── main.tsx            # Точка входу
├── index.html               # HTML шаблон
├── package.json            # Залежності та скрипти
├── tailwind.config.ts      # Конфігурація TailwindCSS
├── tsconfig.json          # Конфігурація TypeScript
└── vite.config.ts         # Конфігурація Vite
```

## 🛠 Технології

### Основні
- **React 18** - Основна бібліотека UI
- **TypeScript** - Статична типізація
- **Vite** - Інструмент збірки та dev server

### Роутинг та навігація
- **React Router v6** - Клієнтський роутинг
- **Lazy Loading** - Розбиття коду по сторінках

### Управління станом
- **Zustand** - Легкий state manager для глобального стану
- **React Query** - Server state management з кешуванням

### Стилізація
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Бібліотека іконок
- **Кастомна колірна палітра** - У стилі BugHerd

### Форми та валідація
- **React Hook Form** - Ефективне управління формами
- **Zod** - Схема валідації TypeScript-first

### Розробка та якість коду
- **ESLint** - Лінтер JavaScript/TypeScript
- **Prettier** - Форматувальник коду
- **Husky** - Git hooks
- **lint-staged** - Лінтинг staged файлів

## 📦 Встановлення

### Вимоги
- Node.js 18+ 
- npm або yarn

### Кроки встановлення

1. **Клонувати репозиторій**
   ```bash
   git clone <repository-url>
   cd client-feedback-hub/frontend
   ```

2. **Встановити залежності**
   ```bash
   npm install
   # або
   yarn install
   ```

3. **Налаштувати змінні середовища**
   ```bash
   cp .env.example .env.local
   ```
   
   Відредагуйте `.env.local` та додайте необхідні змінні:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_URL=http://localhost:5173
   ```

4. **Запустити розробницький сервер**
   ```bash
   npm run dev
   ```

   Додаток буде доступний за адресою `http://localhost:5173`

## 🔧 Доступні команди

### Розробка
```bash
# Запуск dev сервера з hot reload
npm run dev

# Запуск dev сервера з відкриттям в браузері
npm run dev -- --open

# Запуск на певному порту
npm run dev -- --port 3000
```

### Збірка
```bash
# Продакшн збірка
npm run build

# Збірка для staging
npm run build:staging

# Превью продакшн збірки
npm run preview
```

### Тестування
```bash
# Запуск тестів
npm run test

# Запуск тестів в watch mode
npm run test:watch

# Покриття коду
npm run test:coverage
```

### Якість коду
```bash
# Лінтинг
npm run lint

# Виправлення помилок лінтингу
npm run lint:fix

# Форматування коду
npm run format

# Перевірка форматування
npm run format:check

# Перевірка типів TypeScript
npm run type-check
```

## 🏗 Архітектура

### Компоненти

#### Layout компоненти
- `AppLayout` - Основний layout з Header, Sidebar та Content областю
- `AuthLayout` - Layout для сторінок авторизації
- `Header` - Верхній бар з логотипом, пошуком, нотифікаціями
- `Sidebar` - Бічна навігація з адаптивним дизайном

#### UI компоненти
- `Button` - Універсальна кнопка з варіантами та станами
- `Modal` - Модальне вікно з focus management
- `ProjectCard` - Картка проекту зі статистикою
- `FeedbackCard` - Картка відгуку з пріоритетом та статусом
- `FeedbackPinTool` - Інструмент візуального збору відгуків

### Сторінки
- `LoginPage` - Авторизація з валідацією
- `RegisterPage` - Реєстрація з перевіркою міцності пароля
- `DashboardPage` - Головна сторінка з проектами та статистикою
- `ProjectPage` - Сторінка проекту з відгуками та фільтрами
- `NewFeedbackPage` - Форма створення відгуку

### API та стан
- **Mock API** - Повна імітація backend API для розробки
- **React Query хуки** - Кешування, синхронізація та оптимістичні оновлення
- **TypeScript типи** - Повна типізація API інтерфейсів

### Особливості стилізації
- **BugHerd-style дизайн** - Округлі картки, м'які тіні, анімації hover
- **Адаптивна верстка** - Mobile-first підхід
- **Кастомні анімації** - Smooth transitions та hover ефекти
- **Accessibility-first** - ARIA атрибути, focus управління

## 🎨 Дизайн система

### Колірна палітра
```css
/* Основні кольори */
primary: #3b82f6    /* Синій */
success: #10b981    /* Зелений */
warning: #f59e0b    /* Жовтий */
danger: #ef4444     /* Червоний */

/* Відтінки сірого */
gray-50 до gray-900

/* Семантичні кольори */
background: #ffffff
foreground: #0f172a
muted: #f1f5f9
border: #e2e8f0
```

### Типографія
- **Заголовки**: font-bold, responsive розміри
- **Основний текст**: font-normal, 14-16px
- **Допоміжний текст**: font-medium, 12-14px, сірий колір

### Компоненти
- **Радіус**: rounded-xl (12px) для карток, rounded-lg (8px) для інпутів
- **Тіні**: shadow-sm для малих елементів, shadow-lg для модалок
- **Анімації**: hover:scale-[1.02] для карток, transition-all duration-200

## 🔐 Авторизація

### Потік авторизації
1. **Логін/Реєстрація** - JWT токени зберігаються в localStorage
2. **Protected Routes** - Автоматична перевірка токенів
3. **Refresh токени** - Автооновлення при закінченні терміну дії
4. **Logout** - Очищення токенів та кешу

### Демо дані
Для розробки доступні тестові аккаунти:
```
Email: admin@example.com
Password: password
```

## 📱 Responsive дизайн

### Breakpoints
- `sm`: 640px - Малі планшети
- `md`: 768px - Планшети
- `lg`: 1024px - Малі десктопи
- `xl`: 1280px - Великі десктопи

### Адаптивні особливості
- **Mobile-first** - Спочатку мобільна версія
- **Адаптивна навігація** - Burger menu на мобільних
- **Гнучкі сітки** - Grid layouts адаптуються до розміру екрану
- **Оптимізовані форми** - Зручне введення на touch пристроях

## ♿ Accessibility

### Реалізовані функції
- **ARIA атрибути** - labels, roles, states
- **Focus management** - Правильний порядок фокусу
- **Клавіатурна навігація** - Повна підтримка Tab, Enter, Escape
- **Screen reader** - Семантичний HTML та ARIA
- **Контрастність** - WCAG AA сумісність

### Приклади
```tsx
// Кнопка з accessibility
<button
  aria-label="Закрити модальне вікно"
  aria-pressed={isPressed}
  onClick={handleClick}
>
  <X className="h-4 w-4" />
</button>

// Форма з валідацією
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : undefined}
/>
{error && (
  <p id="error-message" role="alert">
    {error}
  </p>
)}
```

## 🧪 Тестування

### Стратегія тестування
- **Unit тести** - Окремі компоненти та хуки
- **Integration тести** - Взаємодія компонентів
- **E2E тести** - Повні користувацькі сценарії

### Приклад тесту
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 🚀 Розгортання

### Збірка для продакшену
```bash
npm run build
```

### Статичний хостинг
Збірка створюється в папці `dist/` та може бути розгорнута на:
- **Vercel** - Рекомендується для React додатків
- **Netlify** - Відмінна підтримка SPA
- **GitHub Pages** - Безкоштовний статичний хостинг
- **AWS S3 + CloudFront** - Для enterprise рішень

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Співробітництво

### Стандарти коду
- **TypeScript** - Суввра типізапція обов'язкова
- **ESLint + Prettier** - Автоматичне форматування
- **Conventional Commits** - Семантичні commit повідомлення
- **Component-first** - Повторно використовувані компоненти

### Процес розробки
1. Створити feature branch від `main`
2. Розробити функціональність з тестами
3. Переконатися що пройшли всі перевірки
4. Створити Pull Request з описом змін
5. Code review та merge

### Commit convention
```
feat: додати компонент FeedbackCard
fix: виправити помилку валідації форми
docs: оновити README з API документацією
style: форматування коду в Button компоненті
refactor: рефакторинг API хуків
test: додати тести для Modal компонента
```

## 📞 Підтримка

Якщо у вас виникли питання чи проблеми:

1. **Перевірте FAQ** в документації
2. **Перегляньте Issues** в репозиторії
3. **Створіть новий Issue** з детальним описом
4. **Зв'яжіться з командою** через Slack/Discord

## 📄 Ліцензія

MIT License - дивіться файл [LICENSE](../LICENSE) для деталей.

---

**Client Feedback Hub** - збирайте та управляйте відгуками легко та ефективно! 🚀