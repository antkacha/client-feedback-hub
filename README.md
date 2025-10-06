# Client Feedback Hub 🚀

Полнофункциональная система сбора отзывов клиентов с визуальным feedback инструментом.

## ✨ Особенности

- 🎯 **Визуальный feedback** - Pin tool для отметки мест на изображениях
- 👥 **Мультипользовательский** - Роли Admin/Manager/User  
- 📊 **Управление проектами** - CRUD операции с проектами
- 🔐 **JWT Аутентификация** - Безопасная система входа
- 📱 **Адаптивный дизайн** - Работает на всех устройствах
- 🎨 **Современный UI** - TailwindCSS + shadcn/ui

## 🚀 Быстрый запуск

```bash
# Клонирование
git clone https://github.com/yourusername/client-feedback-hub.git
cd client-feedback-hub

# Установка зависимостей
cd backend && npm install
cd ../frontend && npm install

# Настройка базы данных  
cd ../backend
npm run db:migrate
npm run db:seed

# Запуск (в разных терминалах)
npm run dev  # Backend на :3001
cd ../frontend && npm run dev  # Frontend на :5173
```

**Тестовые аккаунты:**
- admin@cfh.local / admin123
- manager@cfh.local / manager123  
- user@cfh.local / user123

## � Технологии

**Frontend:** React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui  
**Backend:** Node.js + Express + TypeScript + Prisma + SQLite  
**Auth:** JWT + bcrypt  
**Деплой:** Docker + GitHub Actions

## � Скриншоты

*Добавьте сюда скриншоты вашего приложения после развертывания*

## � Вклад в проект

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - смотрите [LICENSE](LICENSE) для деталей.