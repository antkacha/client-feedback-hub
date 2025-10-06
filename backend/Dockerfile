# Multi-stage build для оптимізації розміру образу

# Стадія збірки
FROM node:18-alpine AS builder

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності
RUN npm ci --only=production && npm cache clean --force

# Генеруємо Prisma клієнт
RUN npx prisma generate

# Копіюємо вихідний код
COPY . .

# Збираємо TypeScript
RUN npm run build

# Продакшн стадія
FROM node:18-alpine AS production

WORKDIR /app

# Встановлюємо тільки runtime залежності
RUN apk add --no-cache tini

# Створюємо користувача без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копіюємо збірку та залежності
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Створюємо папку для завантажень
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Переключаємося на користувача без root
USER nodejs

# Експонуємо порт
EXPOSE 3001

# Перевірка здоров'я контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Використовуємо tini як init процес
ENTRYPOINT ["/sbin/tini", "--"]

# Запускаємо додаток
CMD ["node", "dist/index.js"]