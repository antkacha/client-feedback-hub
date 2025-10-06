# Client Feedback Hub - API Documentation

## API Overview

База URL: `http://localhost:3000/api` (розробка)

Всі API відповіді мають стандартизований формат:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

## Аутентифікація

### POST /api/auth/register
Реєстрація нового користувача.

**Request:**
```typescript
{
  email: string;      // Email адреса
  password: string;   // Пароль (мін. 8 символів)
  name: string;       // Ім'я користувача
}
```

**Response (201):**
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      createdAt: string;
      updatedAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
```

**Errors:**
- `400` - Validation failed
- `409` - Email already exists

---

### POST /api/auth/login
Вхід користувача в систему.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
```

**Errors:**  
- `400` - Invalid credentials
- `401` - Account not activated

---

### POST /api/auth/refresh  
Оновлення access токену.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
```

---

### POST /api/auth/logout
Вихід з системи (invalidate токени).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    message: "Logged out successfully";
  };
}
```

## Користувачі

### GET /api/users/profile
Отримати профіль поточного користувача.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### PUT /api/users/profile
Оновити профіль користувача.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name?: string;
  email?: string;
  currentPassword?: string;  // Required if changing email
  newPassword?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    user: User;
  };
}
```

---

### GET /api/users
Список всіх користувачів (тільки для ADMIN/MANAGER).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10, max: 100)
- `search?: string` (пошук по name/email)
- `role?: UserRole`

**Response (200):**
```typescript
{
  success: true;
  data: User[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

## Проєкти

### GET /api/projects
Отримати список проєктів користувача.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10)
- `status?: ProjectStatus`
- `search?: string`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      feedbacks: number;
      members: number;
    };
  }[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

---

### POST /api/projects
Створити новий проєкт.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name: string;              // 3-100 символів
  description?: string;      // до 500 символів
  status?: ProjectStatus;    // default: ACTIVE
}
```

**Response (201):**
```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### GET /api/projects/:id
Отримати деталі проєкту.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    members: {
      id: string;
      role: MemberRole;
      createdAt: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }[];
    _count: {
      feedbacks: number;
    };
  };
}
```

**Errors:**
- `404` - Project not found
- `403` - Access denied

---

### PUT /api/projects/:id
Оновити проєкт.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name?: string;
  description?: string;
  status?: ProjectStatus;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Project;
}
```

**Permissions:** Тільки власник або ADMIN

---

### DELETE /api/projects/:id
Видалити проєкт.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    message: "Project deleted successfully";
  };
}
```

**Permissions:** Тільки власник або ADMIN

## Відгуки

### GET /api/projects/:projectId/feedbacks
Отримати відгуки проєкту.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10)
- `status?: FeedbackStatus`
- `rating?: number` (1-5)
- `pinned?: boolean`
- `search?: string`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    content: string;
    rating: number;
    status: FeedbackStatus;
    isPinned: boolean;
    projectId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

---

### POST /api/projects/:projectId/feedbacks
Створити новий відгук.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  content: string;     // 10-1000 символів
  rating: number;      // 1-5
}
```

**Response (201):**
```typescript
{
  success: true;
  data: {
    id: string;
    content: string;
    rating: number;
    status: FeedbackStatus;
    isPinned: boolean;
    projectId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### GET /api/feedbacks/:id
Отримати деталі відгуку.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    content: string;
    rating: number;
    status: FeedbackStatus;
    isPinned: boolean;
    projectId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
    project: {
      id: string;
      name: string;
    };
  };
}
```

---

### PUT /api/feedbacks/:id
Оновити відгук.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  content?: string;
  rating?: number;
  status?: FeedbackStatus;     // Тільки для MANAGER/ADMIN
  isPinned?: boolean;          // Тільки для MANAGER/ADMIN
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Feedback;
}
```

**Permissions:** 
- Власник відгуку може редагувати content/rating
- MANAGER/ADMIN можуть змінювати status/isPinned

---

### DELETE /api/feedbacks/:id
Видалити відгук.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    message: "Feedback deleted successfully";
  };
}
```

**Permissions:** Власник відгуку, власник проєкту або ADMIN

## Статистика та аналітика

### GET /api/projects/:id/analytics
Отримати аналітику проєкту.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period?: string` ('day' | 'week' | 'month' | 'year')
- `from?: string` (ISO date)
- `to?: string` (ISO date)

**Response (200):**
```typescript
{
  success: true;
  data: {
    summary: {
      totalFeedbacks: number;
      averageRating: number;
      statusDistribution: {
        PENDING: number;
        APPROVED: number;
        REJECTED: number;
      };
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    trends: {
      date: string;
      feedbacksCount: number;
      averageRating: number;
    }[];
    pinnedFeedbacks: {
      id: string;
      content: string;
      rating: number;
      createdAt: string;
      author: {
        name: string;
      };
    }[];
  };
}
```

---

### GET /api/admin/analytics
Загальна аналітика системи (тільки для ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    users: {
      total: number;
      new: number;  // за останні 30 днів
      active: number;  // за останні 7 днів
    };
    projects: {
      total: number;
      active: number;
      inactive: number;
      archived: number;
    };
    feedbacks: {
      total: number;
      thisMonth: number;
      averageRating: number;
    };
    growth: {
      users: number;     // % зростання за місяць
      projects: number;
      feedbacks: number;
    };
  };
}
```

## Адміністрування

### GET /api/admin/users
Управління користувачами (тільки для ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number`
- `limit?: number` 
- `search?: string`
- `role?: UserRole`
- `active?: boolean`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    _count: {
      projects: number;
      feedbacks: number;
    };
  }[];
  meta: {
    pagination: PaginationMeta;
  };
}
```

---

### PUT /api/admin/users/:id
Оновити користувача (тільки для ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  role?: UserRole;
  isActive?: boolean;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: User;
}
```

---

### DELETE /api/admin/users/:id
Видалити користувача (тільки для ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    message: "User deleted successfully";
  };
}
```

## Коди помилок

### Загальні помилки
- `400` - Bad Request (неправильні дані)
- `401` - Unauthorized (не аутентифікований)
- `403` - Forbidden (немає дозволу)
- `404` - Not Found (ресурс не знайдено)
- `409` - Conflict (конфлікт даних)
- `422` - Unprocessable Entity (помилки валідації)
- `429` - Too Many Requests (занадто багато запитів)
- `500` - Internal Server Error

### Спеціальні коди помилок
```typescript
interface ErrorCodes {
  // Auth
  'AUTH_INVALID_CREDENTIALS': 'Неправильні дані для входу';
  'AUTH_TOKEN_EXPIRED': 'Токен прострочено';
  'AUTH_TOKEN_INVALID': 'Недійсний токен';
  'AUTH_EMAIL_EXISTS': 'Email вже використовується';
  
  // Users  
  'USER_NOT_FOUND': 'Користувача не знайдено';
  'USER_INACTIVE': 'Аккаунт деактивовано';
  
  // Projects
  'PROJECT_NOT_FOUND': 'Проєкт не знайдено';
  'PROJECT_ACCESS_DENIED': 'Немає доступу до проєкту';
  'PROJECT_NAME_EXISTS': 'Проєкт з такою назвою вже існує';
  
  // Feedbacks
  'FEEDBACK_NOT_FOUND': 'Відгук не знайдено';
  'FEEDBACK_ACCESS_DENIED': 'Немає доступу до відгуку';
  'FEEDBACK_ALREADY_RATED': 'Ви вже залишили відгук';
}
```

## Rate Limiting

API має обмеження на кількість запитів:

| Endpoint | Ліміт | Вікно |
|----------|-------|-------|
| `/api/auth/*` | 5 req | 1 min |
| `/api/*` | 100 req | 15 min |
| `/api/feedbacks` POST | 10 req | 1 hour |

При перевищенні ліміту повертається:
```typescript
{
  success: false;
  error: {
    message: "Too many requests";
    code: "RATE_LIMIT_EXCEEDED";
    details: {
      limit: 100;
      remaining: 0;
      resetAt: "2024-01-01T12:00:00Z";
    };
  };
}
```

## Приклади використання

### JavaScript/TypeScript
```typescript
// Аутентифікація
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await response.json();
const { accessToken } = data.tokens;

// Використання токену
const projects = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
});
```

### cURL
```bash
# Логін
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Отримати проєкти
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Створити відгук
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"content":"Чудовий проєкт!","rating":5}'
```

## WebSocket API (майбутня функціональність)

Для real-time оновлень планується WebSocket підключення:

```typescript
// Підключення
const ws = new WebSocket('ws://localhost:3000/ws');

// Автентифікація через WebSocket
ws.send(JSON.stringify({
  type: 'auth',
  token: accessToken
}));

// Підписка на оновлення проєкту
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: `project:${projectId}`
}));

// Обробка подій
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'feedback:created':
      // Новий відгук додано
      break;
    case 'feedback:updated':
      // Відгук оновлено
      break;
    case 'project:updated':
      // Проєкт оновлено
      break;
  }
};
```

## Підтримка та питання

Для технічної підтримки та питань щодо API:
- Email: dev@cfh.example.com
- GitHub Issues: https://github.com/yourusername/client-feedback-hub/issues
- Documentation: https://docs.cfh.example.com