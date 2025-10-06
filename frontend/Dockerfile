# Multi-stage build для frontend

# Стадія збірки
FROM node:18-alpine AS builder

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci && npm cache clean --force

# Копіюємо вихідний код
COPY . .

# Встановлюємо змінні середовища для збірки
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL

# Збираємо додаток
RUN npm run build

# Продакшн стадія з nginx
FROM nginx:alpine AS production

# Копіюємо кастомну конфігурацію nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Копіюємо збірку з попередньої стадії
COPY --from=builder /app/dist /usr/share/nginx/html

# Додаємо script для підтримки client-side routing
RUN echo '#!/bin/sh' > /docker-entrypoint.d/50-client-side-routing.sh && \
    echo 'find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__API_URL__|$API_URL|g" {} \;' >> /docker-entrypoint.d/50-client-side-routing.sh && \
    chmod +x /docker-entrypoint.d/50-client-side-routing.sh

# Експонуємо порт
EXPOSE 3000

# Перевірка здоров'я контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Запускаємо nginx
CMD ["nginx", "-g", "daemon off;"]