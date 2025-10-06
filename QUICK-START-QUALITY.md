# ⚡ Швидкий старт - Code Quality Setup

Це швидкий гід по налаштуванню та використанню інструментів якості коду.

## 🚀 Встановлення

```bash
# 1. Встановити залежності
npm run install:all

# 2. Ініціалізувати Git hooks
npm run prepare

# 3. Перевірити що все працює
npm run auto-fix
```

## 📋 Основні команди

```bash
# Автоматичне виправлення всього
npm run auto-fix

# Окремі команди
npm run lint:fix      # Виправити ESLint помилки
npm run format        # Форматувати код
npm run typecheck     # Перевірити типи
npm run test:ci       # Запустити тести
```

## 🤖 Що відбувається автоматично

### При коміті (pre-commit):
- ✅ ESLint виправляє помилки в staged файлах
- ✅ Prettier форматує код
- ✅ TypeScript перевіряє типи

### При push (pre-push):
- ✅ Запускаються unit тести
- ❌ Push блокується якщо тести провалились

### При PR/Push до GitHub:
- ✅ Повна CI/CD pipeline
- ✅ Лінтинг, тести, збірка, безпека

## 🆘 Якщо щось пішло не так

### Відкотити зміни автофіксу:
```bash
# Використати backup (створюється автоматично)
ls | grep backup-
cp -r backup-XXXXXX/frontend-src/* frontend/src/

# Або Git відкат
git checkout HEAD -- .
```

### Пропустити hooks:
```bash
git commit --no-verify -m "emergency commit"
git push --no-verify origin main
```

### Виправити проблеми:
```bash
# Детальний лог
cat /tmp/auto-fix.log

# Звіт з рекомендаціями  
cat /tmp/test-report.txt
```

## 📖 Повна документація

Детальну інформацію дивіться в [CODE-QUALITY-SETUP.md](./CODE-QUALITY-SETUP.md)

---

**Готово! Код автоматично підтримується в чистоті 🧹✨**