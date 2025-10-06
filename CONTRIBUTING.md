# Contributing to Client Feedback Hub

Дякуємо за інтерес до участі в розвитку Client Feedback Hub! Ваш внесок надзвичайно цінний для покращення платформи.

## 🤝 Як зробити внесок

### 1. Підготовка середовища розробки

```bash
# Форкніть репозиторій та клонуйте його
git clone https://github.com/yourusername/client-feedback-hub.git
cd client-feedback-hub

# Додайте оригінальний репозиторій як upstream
git remote add upstream https://github.com/originaluser/client-feedback-hub.git

# Налаштуйте проєкт
./setup-dev.sh
```

### 2. Створення нової функції

```bash
# Створіть нову гілку від main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# Або для виправлення багів
git checkout -b fix/bug-description
```

### 3. Розробка

- Пишіть зрозумілий код з коментарями українською мовою
- Дотримуйтесь існуючого стилю коду
- Додавайте тести для нової функціональності
- Оновлюйте документацію при необхідності

### 4. Тестування

```bash
# Запустіть всі тести перед комітом
./test-all.sh

# Або окремо:
npm run lint
npm run test
npm run build
```

### 5. Коміт змін

```bash
# Зробіть атомарні коміти з описовими повідомленнями
git add .
git commit -m "feat: додано можливість експорту відгуків в CSV"

# Або для виправлень:
git commit -m "fix: виправлено помилку валідації email адреси"
```

### 6. Pull Request

```bash
# Запушіть зміни в свій форк
git push origin feature/your-feature-name

# Створіть Pull Request через GitHub web interface
```

## 📋 Стандарти коду

### TypeScript/JavaScript

```typescript
// ✅ Добре
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ❌ Погано
const validateEmail = (e) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};
```

### React компоненти

```tsx
// ✅ Добре
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ❌ Погано
export const Button = ({ children, variant, onClick }) => (
  <button onClick={onClick}>{children}</button>
);
```

### API endpoints

```typescript
// ✅ Добре
export const createProject = async (
  data: CreateProjectRequest
): Promise<ApiResponse<Project>> => {
  const response = await api.post('/projects', data);
  return response.data;
};

// ❌ Погано
export const createProject = async (data: any) => {
  return await api.post('/projects', data);
};
```

## 🧪 Тестування

### Unit тести

```typescript
// ✅ Добре
describe('validateEmail', () => {
  it('повинен повертати true для валідного email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('повинен повертати false для невалідного email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('повинен обробляти порожній рядок', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### Integration тести

```typescript
// ✅ Добре
describe('POST /api/projects', () => {
  beforeEach(async () => {
    await setupTestDb();
  });

  it('повинен створити новий проєкт для аутентифікованого користувача', async () => {
    const user = await createTestUser();
    const token = generateTestToken(user);

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Тестовий проєкт',
        description: 'Опис тестового проєкту',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Тестовий проєкт');
  });
});
```

## 📝 Стиль комітів

Використовуємо [Conventional Commits](https://www.conventionalcommits.org/):

### Типи комітів
- `feat:` - нова функціональність
- `fix:` - виправлення багу
- `docs:` - зміни в документації
- `style:` - форматування коду (без змін логіки)
- `refactor:` - рефакторинг коду
- `test:` - додавання або зміна тестів
- `chore:` - зміни в build процесі або допоміжних інструментах

### Приклади

```bash
# Нова функція
git commit -m "feat: додано можливість експорту відгуків в PDF"

# Виправлення бага
git commit -m "fix: виправлено помилку валідації при створенні проєкту"

# Документація
git commit -m "docs: оновлено README з інструкціями по деплою"

# Рефакторинг
git commit -m "refactor: винесено валідацію email в окремий утиліт"

# Тести
git commit -m "test: додано тести для AuthContext"
```

## 🔍 Code Review

### Що перевіряємо

#### Функціональність
- [ ] Код працює відповідно до вимог
- [ ] Обробляються всі граничні випадки
- [ ] Немає регресій в існуючій функціональності

#### Якість коду
- [ ] Код читабельний та зрозумілий
- [ ] Дотримується стиль проєкту
- [ ] Немає дублювання коду
- [ ] Використовуються правильні абстракції

#### Тестування
- [ ] Додані відповідні тести
- [ ] Тести покривають основні сценарії
- [ ] Всі тести проходять

#### Документація
- [ ] API документація оновлена
- [ ] Додані коментарі для складної логіки
- [ ] README оновлено при необхідності

#### Безпека
- [ ] Немає уразливостей безпеки
- [ ] Дані правильно валідуються
- [ ] Використовуються безпечні практики

## 🐛 Повідомлення про баги

### Перед створенням issue

1. Перевірте, чи не існує подібної проблеми
2. Переконайтеся, що проблема відтворюється
3. Оновіться до останньої версії

### Шаблон bug report

```markdown
## 🐛 Опис бага
Короткий опис проблеми.

## 🔄 Кроки відтворення
1. Перейдіть на сторінку '...'
2. Натисніть на '...'
3. Прокрутіть вниз до '...'
4. Помилка з'являється

## ✅ Очікувана поведінка
Опис того, що повинно відбуватися.

## ❌ Фактична поведінка
Опис того, що відбувається насправді.

## 📱 Середовище
- OS: [macOS 13.0]
- Browser: [Chrome 91.0]
- Node.js: [18.17.0]
- Version: [1.2.0]

## 📋 Додаткова інформація
Скріншоти, логи, або інша корисна інформація.
```

## 💡 Пропозиції функцій

### Шаблон feature request

```markdown
## 🚀 Опис функції
Детальний опис пропонованої функції.

## 🎯 Мотивація
Яку проблему це вирішить? Чому це важливо?

## 💭 Альтернативи
Які альтернативні рішення ви розглядали?

## 📝 Деталі реалізації
Як ви бачите реалізацію цієї функції?

## 🧪 Критерії прийняття
- [ ] Критерій 1
- [ ] Критерій 2
- [ ] Критерій 3
```

## 📚 Ресурси

### Документація
- [API Documentation](./API_DOCS.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Quick Start](./QUICKSTART.md)

### Стиль коду
- [ESLint Config](./.eslintrc.cjs)
- [Prettier Config](./.prettierrc)
- [TypeScript Config](./tsconfig.json)

### Інструменти
- [Husky](./.husky/) - Git hooks
- [lint-staged](./package.json) - Pre-commit linting
- [GitHub Actions](./.github/workflows/) - CI/CD

## 🏆 Визнання

Всі контрибьютори будуть додані до файлу [CONTRIBUTORS.md](./CONTRIBUTORS.md).

Типи внесків:
- 💻 Code
- 📖 Documentation  
- 🐛 Bug reports
- 💡 Ideas & Planning
- 🎨 Design
- 🧪 Testing
- 🌍 Translation
- 📢 Outreach

## ❓ Питання

Якщо у вас є питання про процес контрибуції:

- Створіть [Discussion](https://github.com/yourusername/client-feedback-hub/discussions)
- Напишіть на email: dev@cfh.example.com
- Приєднайтесь до нашого Discord: [посилання]

---

Дякуємо за ваш внесок в розвиток Client Feedback Hub! 🙏