# Code Quality & CI/CD Setup для Client Feedback Hub

Це документ описує налаштування автоматичної перевірки якості коду, форматування та CI/CD для проекту.

## 📋 Зміст

- [🛠️ Налаштовані інструменти](#️-налаштовані-інструменти)
- [🚀 Швидкий старт](#-швидкий-старт)  
- [📜 Доступні команди](#-доступні-команди)
- [🔧 Конфігурації](#-конфігурації)
- [🤖 Автоматизація](#-автоматизація)
- [📊 CI/CD Pipeline](#-cicd-pipeline)
- [🆘 Відкат змін](#-відкат-змін)
- [❗ Troubleshooting](#-troubleshooting)

## 🛠️ Налаштовані інструменти

### Лінтинг та форматування
- **ESLint** - статичний аналіз коду з TypeScript підтримкою
- **Prettier** - автоматичне форматування коду
- **EditorConfig** - консистентне форматування в різних редакторах

### Автоматизація
- **Husky** - Git hooks для pre-commit та pre-push перевірок
- **lint-staged** - запуск лінтингу тільки на staged файлах
- **GitHub Actions** - CI/CD pipeline

### Безпека
- **npm audit** - перевірка вразливостей в залежностях
- **Snyk** - додаткова перевірка безпеки (опціонально)

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
# Встановити всі залежності
npm run install:all

# Або послідовно
npm install
cd frontend && npm install
cd ../server && npm install
```

### 2. Ініціалізація Git hooks

```bash
# Ініціалізувати Husky
npm run prepare
```

### 3. Перевірка налаштувань

```bash
# Запустити повну перевірку та автофікс
npm run auto-fix

# Або окремі команди
npm run lint        # Перевірка ESLint
npm run format      # Форматування Prettier
npm run typecheck   # Перевірка TypeScript типів
npm run test        # Запуск тестів
```

## 📜 Доступні команди

### Лінтинг та форматування

```bash
# ESLint
npm run lint              # Перевірити код
npm run lint:fix          # Автоматично виправити помилки

# Prettier
npm run format            # Відформатувати всі файли
npm run format:check      # Перевірити форматування

# TypeScript
npm run typecheck         # Перевірити типи
npm run typecheck:frontend # Тільки frontend
npm run typecheck:backend  # Тільки backend
```

### Тестування

```bash
npm run test              # Запустити всі тести
npm run test:ci           # Тести для CI (без watch)
npm run test:frontend     # Тільки frontend тести
npm run test:backend      # Тільки backend тести
npm run test:flow         # Інтеграційні тести
```

### Збірка

```bash
npm run build             # Зібрати все
npm run build:frontend    # Зібрати frontend
npm run build:backend     # Зібрати backend
```

### Утиліти

```bash
npm run auto-fix          # Автоматичне виправлення та звіт
npm run clean             # Очистити node_modules та dist
npm run install:all       # Встановити всі залежності
```

## 🔧 Конфігурації

### ESLint (.eslintrc.js)

```javascript
// Налаштований для:
// - TypeScript підтримка
// - React правила  
// - Accessibility перевірки
// - Import/export правила
// - Різні налаштування для frontend/backend
```

**Основні правила:**
- Попередження для `console.*` (frontend), дозволено (backend)
- Заборона `any` типу (з попередженням)
- Обов'язкова обробка Promise
- Автоматичне сортування imports
- Видалення невикористаних змінних

### Prettier (.prettierrc)

```json
{
  "semi": true,              // Крапка з комою
  "singleQuote": true,       // Одинарні лапки
  "printWidth": 100,         // Довжина рядка
  "tabWidth": 2,             // Розмір табуляції
  "trailingComma": "es5"     // Коми в кінці
}
```

### EditorConfig (.editorconfig)

- UTF-8 кодування
- LF перенос рядків
- 2 пробіли для відступів
- Автоматичне видалення trailing spaces

## 🤖 Автоматизація

### Pre-commit Hook

Автоматично запускається перед кожним комітом:

1. **lint-staged** - обробляє тільки staged файли
2. **ESLint --fix** - виправляє помилки автоматично
3. **Prettier** - форматує код
4. **TypeScript check** - перевіряє типи

```bash
# Якщо хук блокує коміт, виправте помилки та спробуйте знов
git add .
git commit -m "your message"
```

### Pre-push Hook

Автоматично запускається перед push:

1. **Запуск тестів** - unit та інтеграційні тести
2. **Блокування push** при провалі тестів

```bash
# Якщо тести провалились
git push origin main  # ❌ Заблоковано

# Виправте тести та спробуйте знов
npm run test:ci       # Перевірити локально
git push origin main  # ✅ Дозволено
```

### Автоматичний фікс скрипт

Комплексний скрипт для виправлення та перевірки:

```bash
# Повна перевірка
npm run auto-fix

# Тільки лінтинг
./scripts/auto_fix_and_report.sh --only-lint

# Без backup
./scripts/auto_fix_and_report.sh --no-backup

# Показати довідку
./scripts/auto_fix_and_report.sh --help
```

**Що робить скрипт:**
1. 📦 Створює backup вашого коду
2. 🔧 Запускає ESLint автофікс
3. 💅 Форматує код через Prettier
4. 🔍 Перевіряє TypeScript типи
5. 🧪 Запускає unit тести
6. 📄 Генерує детальний звіт в `/tmp/test-report.txt`

## 📊 CI/CD Pipeline

GitHub Actions автоматично запускається при:
- Push до `main` та `develop` гілок
- Створенні Pull Request
- Ручному запуску

### Pipeline кроки:

1. **🔍 Лінтинг** - ESLint + Prettier перевірка
2. **🔧 Type Check** - TypeScript перевірка типів
3. **🧪 Тестування** - Unit тести з PostgreSQL
4. **🏗️ Збірка** - Frontend (Vite) + Backend (TypeScript)
5. **🛡️ Безпека** - npm audit + Snyk scan
6. **🔗 Інтеграційні тести** - API flow тестування (тільки main)

### Налаштування Secrets

В GitHub Repository Settings → Secrets додайте:

```bash
# Опціонально для Snyk
SNYK_TOKEN=your-snyk-token

# Для production збірки
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Статус Badge

Додайте в README.md:

```markdown
![CI](https://github.com/yourusername/client-feedback-hub/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## 🆘 Відкат змін

### Якщо автофікс зламав код

1. **Використати backup з скрипта:**
```bash
# Знайти backup папку
ls -la | grep backup-

# Відновити файли
cp -r backup-20241224-143022/frontend-src/* frontend/src/
cp -r backup-20241224-143022/server-src/* server/src/
```

2. **Git відкат:**
```bash
# Відкотити до останнього коміту
git checkout HEAD -- .

# Відкотити конкретні файли
git checkout HEAD -- frontend/src/specific-file.ts

# Створити stash перед експериментами
git stash push -m "before auto-fix"
git stash pop  # відновити
```

3. **Відключити hooks тимчасово:**
```bash
# Коміт без pre-commit hooks
git commit --no-verify -m "emergency commit"

# Push без pre-push hooks  
git push --no-verify origin main
```

### Якщо CI провалився

1. **Локальна перевірка:**
```bash
# Запустити те саме що й CI
npm run lint
npm run typecheck  
npm run test:ci
npm run build
```

2. **Пропустити CI для термінових випадків:**
```bash
git commit -m "fix: emergency fix [skip ci]"
```

3. **Відкотити PR:**
```bash
# Якщо PR змерджено з помилками
git revert <commit-hash>
git push origin main
```

## ❗ Troubleshooting

### Проблема: ESLint помилки не виправляються автоматично

```bash
# Виправити конкретний файл
npx eslint --fix src/specific-file.ts

# Ігнорувати правило в коді
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;

# Відключити правило для файлу
/* eslint-disable @typescript-eslint/no-unused-vars */
```

### Проблема: Prettier конфлікт з ESLint

```bash
# Перевірити конфлікти
npx eslint-config-prettier

# Виправити порядок у .eslintrc.js (prettier має бути останнім)
extends: [
  'eslint:recommended',
  '@typescript-eslint/recommended', 
  'prettier' // ← має бути останнім
]
```

### Проблема: TypeScript помилки

```bash
# Перевірити конфігурацію
npx tsc --showConfig

# Ігнорувати TypeScript помилку
// @ts-ignore
const result = riskyOperation();

# Додати типи
npm install --save-dev @types/package-name
```

### Проблема: Тести не проходять в CI

```bash
# Тести локально
npm run test:ci

# Тести з тим самим NODE_ENV
NODE_ENV=test npm run test:ci

# Очистити кеш Jest
npx jest --clearCache
```

### Проблема: Husky hooks не працюють

```bash
# Переініціалізувати Husky
rm -rf .husky
npm run prepare

# Перевірити права доступу
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Тестувати hook
.husky/pre-commit
```

### Проблема: Dependencies конфлікти

```bash
# Очистити все
npm run clean
rm -rf package-lock.json
npm install

# Оновити до останніх версій
npx npm-check-updates -u
npm install
```

## 🔧 Тонке налаштування

### Вимкнути певні правила ESLint

В `.eslintrc.js`:

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'off',
  'react/prop-types': 'off',
  // додайте свої правила
}
```

### Ігнорувати файли

Створіть `.eslintignore`:

```
dist/
coverage/
node_modules/
*.config.js
```

### Налаштувати Prettier для конкретних файлів

В `.prettierrc`:

```json
{
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "printWidth": 80
      }
    }
  ]
}
```

---

## 📞 Підтримка

Якщо виникли питання або проблеми:

1. Перевірте цю документацію
2. Подивіться логи: `/tmp/auto-fix.log` та `/tmp/test-report.txt`
3. Створіть Issue в репозиторії
4. Запустіть `npm run auto-fix -- --help` для довідки

**Успішної розробки! 🚀**