/**
 * ESLint конфігурація для TypeScript проекту
 * Налаштована для frontend (React) та backend (Node.js)
 */

module.exports = {
  // Використовуємо останню версію ESLint
  env: {
    es2022: true, // Підтримка сучасного JavaScript
    node: true, // Для backend коду
    browser: true, // Для frontend коду
  },

  // Базові конфігурації
  extends: [
    'eslint:recommended', // Базові рекомендації ESLint
    '@typescript-eslint/recommended', // TypeScript правила
    '@typescript-eslint/recommended-requiring-type-checking', // Строгі TypeScript правила
    'plugin:react/recommended', // React правила
    'plugin:react-hooks/recommended', // React Hooks правила
    'plugin:jsx-a11y/recommended', // Accessibility правила
    'plugin:import/recommended', // Правила для імпортів
    'plugin:import/typescript', // TypeScript підтримка для імпортів
    'prettier', // Інтеграція з Prettier (має бути останньою)
  ],

  // Парсер для TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022, // Версія ECMAScript
    sourceType: 'module', // ES модулі
    project: ['./tsconfig.json', './frontend/tsconfig.json', './server/tsconfig.json'], // TypeScript проекти
    ecmaFeatures: {
      jsx: true, // JSX підтримка
    },
  },

  // Плагіни
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'unused-imports', // Для видалення невикористаних імпортів
  ],

  // Налаштування для React
  settings: {
    react: {
      version: 'detect', // Автоматичне визначення версії React
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // Завжди шукати типи
        project: ['./tsconfig.json', './frontend/tsconfig.json', './server/tsconfig.json'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // Розширення файлів
      },
    },
  },

  // Основні правила
  rules: {
    // ========== TypeScript правила ==========
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_', // Ігнорувати аргументи що починаються з _
        varsIgnorePattern: '^_', // Ігнорувати змінні що починаються з _
        caughtErrorsIgnorePattern: '^_', // Ігнорувати catch errors що починаються з _
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Попереджувати про any
    '@typescript-eslint/no-non-null-assertion': 'warn', // Попереджувати про !
    '@typescript-eslint/prefer-nullish-coalescing': 'error', // Використовувати ??
    '@typescript-eslint/prefer-optional-chain': 'error', // Використовувати ?.
    '@typescript-eslint/no-floating-promises': 'error', // Обов'язково обробляти Promise
    '@typescript-eslint/await-thenable': 'error', // await тільки для Promise
    '@typescript-eslint/no-misused-promises': 'error', // Правильне використання Promise
    '@typescript-eslint/require-await': 'warn', // async функції мають містити await

    // ========== Загальні JavaScript правила ==========
    'no-console': 'warn', // Попереджувати про console.*
    'no-debugger': 'error', // Забороняти debugger
    'no-alert': 'error', // Забороняти alert, confirm, prompt
    'no-var': 'error', // Використовувати let/const замість var
    'prefer-const': 'error', // Використовувати const коли можливо
    'no-unused-expressions': 'error', // Забороняти невикористані вирази
    'consistent-return': 'error', // Консистентні return
    'no-return-assign': 'error', // Не присвоювати в return
    'no-param-reassign': 'warn', // Не змінювати параметри функцій

    // ========== Імпорти ==========
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Node.js модулі
          'external', // npm пакети
          'internal', // Внутрішні модулі
          'parent', // Батьківські модулі
          'sibling', // Сусідні модулі
          'index', // Index файли
        ],
        'newlines-between': 'always', // Порожні рядки між групами
        alphabetize: {
          order: 'asc', // Алфавітний порядок
          caseInsensitive: true, // Ігнорувати регістр
        },
      },
    ],
    'import/no-unresolved': 'error', // Забороняти неіснуючі імпорти
    'import/no-duplicates': 'error', // Забороняти дублікати імпортів
    'unused-imports/no-unused-imports': 'error', // Видаляти невикористані імпорти
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // ========== React правила ==========
    'react/react-in-jsx-scope': 'off', // React 17+ не потребує імпорту React
    'react/prop-types': 'off', // Використовуємо TypeScript замість PropTypes
    'react/jsx-uses-react': 'off', // React 17+
    'react/jsx-uses-vars': 'error', // Використовувати JSX змінні
    'react/jsx-no-unused-vars': 'error', // Не використовувати невикористані JSX змінні
    'react/jsx-pascal-case': 'error', // PascalCase для компонентів
    'react/jsx-no-duplicate-props': 'error', // Не дублювати props
    'react/jsx-no-undef': 'error', // Забороняти невизначені змінні в JSX
    'react/no-unused-state': 'warn', // Попереджувати про невикористаний state
    'react/prefer-stateless-function': 'warn', // Віддавати перевагу функціональним компонентам

    // ========== React Hooks правила ==========
    'react-hooks/rules-of-hooks': 'error', // Правила хуків
    'react-hooks/exhaustive-deps': 'warn', // Залежності в useEffect

    // ========== Accessibility правила ==========
    'jsx-a11y/alt-text': 'error', // Alt текст для зображень
    'jsx-a11y/anchor-is-valid': 'error', // Валідні якорі
    'jsx-a11y/click-events-have-key-events': 'warn', // Клавіатурна доступність
    'jsx-a11y/no-static-element-interactions': 'warn', // Інтерактивні елементи

    // ========== Стиль коду ==========
    'object-shorthand': 'error', // Використовувати скорочення об'єктів
    'prefer-destructuring': [
      'warn',
      {
        array: false, // Не обов'язково для масивів
        object: true, // Обов'язково для об'єктів
      },
    ],
    'prefer-template': 'error', // Використовувати template literals
    'template-curly-spacing': ['error', 'never'], // Пробіли в template literals
    'quote-props': ['error', 'as-needed'], // Лапки в властивостях тільки коли потрібно
  },

  // Переопределення для різних типів файлів
  overrides: [
    // ========== Backend файли (Node.js) ==========
    {
      files: ['server/**/*.ts', 'server/**/*.js'],
      env: {
        node: true,
        browser: false, // Вимикаємо браузерне середовище
      },
      rules: {
        // В серверному коді можна використовувати console
        'no-console': 'off',
        // React правила не потрібні для серверу
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'jsx-a11y/alt-text': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        // Серверний код може використовувати require()
        '@typescript-eslint/no-var-requires': 'warn',
      },
    },

    // ========== Frontend файли (React) ==========
    {
      files: ['frontend/**/*.ts', 'frontend/**/*.tsx', 'frontend/**/*.js', 'frontend/**/*.jsx'],
      env: {
        browser: true,
        node: false, // Вимикаємо Node.js середовище
      },
      rules: {
        // У фронтенді console допустимо для debug
        'no-console': 'warn',
        // Строгіші правила для React
        'react/jsx-key': 'error', // key prop для списків
        'react/no-array-index-key': 'warn', // Не використовувати index як key
      },
    },

    // ========== Тестові файли ==========
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/test/**/*'],
      env: {
        jest: true, // Jest середовище
      },
      rules: {
        // У тестах можна використовувати console та any
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        // У тестах можна не обробляти Promise
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },

    // ========== Конфігураційні файли ==========
    {
      files: ['*.config.js', '*.config.ts', '.eslintrc.js', 'prettier.config.js'],
      env: {
        node: true,
      },
      rules: {
        // У конфігах можна використовувати require та console
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
  ],

  // Ігнорувати певні глобальні змінні
  globals: {
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    // Node.js globals
    process: 'readonly',
    Buffer: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    // Jest globals
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
  },
};