#!/bin/bash

# Client Feedback Hub - Скрипт швидкого налаштування
# Автоматично налаштовує проєкт для локальної розробки

set -e  # Зупинити при помилці

echo "🚀 Client Feedback Hub - Швидке налаштування"
echo "=============================================="

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Перевірка передумов
check_requirements() {
    print_status "Перевірка системних вимог..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js не знайдено. Встановіть Node.js 18+ з https://nodejs.org/"
        exit 1
    fi
    
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Потрібен Node.js 18+. Поточна версія: $(node -v)"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        print_error "npm не знайдено. Встановіть npm разом з Node.js"
        exit 1
    fi
    
    # PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL не знайдено. Встановіть PostgreSQL 14+ або запустіть через Docker"
        print_status "Для macOS: brew install postgresql"
        print_status "Для Ubuntu: sudo apt install postgresql postgresql-contrib"
        echo -n "Продовжити без PostgreSQL? (y/N): "
        read -r continue_without_pg
        if [[ ! $continue_without_pg =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Системні вимоги перевірено"
}

# Встановлення залежностей
install_dependencies() {
    print_status "Встановлення залежностей..."
    
    # Root
    print_status "Встановлення root залежностей..."
    npm install
    
    # Backend
    print_status "Встановлення backend залежностей..."
    cd backend
    npm install
    cd ..
    
    # Frontend
    print_status "Встановлення frontend залежностей..."
    cd frontend
    npm install
    cd ..
    
    print_success "Залежності встановлено"
}

# Налаштування змінних середовища
setup_environment() {
    print_status "Налаштування змінних середовища..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Створено backend/.env"
    else
        print_warning "backend/.env вже існує"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        print_success "Створено frontend/.env"
    else
        print_warning "frontend/.env вже існує"
    fi
    
    print_warning "Не забудьте відредагувати .env файли з вашими налаштуваннями!"
}

# Налаштування бази даних
setup_database() {
    print_status "Налаштування бази даних..."
    
    # Перевірка підключення до PostgreSQL
    if command -v psql &> /dev/null; then
        # Спроба створити базу даних
        if psql -lqt | cut -d \| -f 1 | grep -qw client_feedback_hub; then
            print_warning "База даних client_feedback_hub вже існує"
        else
            print_status "Створення бази даних client_feedback_hub..."
            createdb client_feedback_hub 2>/dev/null || {
                print_warning "Не вдалося створити БД автоматично. Створіть вручну:"
                print_status "psql -c \"CREATE DATABASE client_feedback_hub;\""
            }
        fi
        
        # Генерація Prisma клієнта та міграції
        cd backend
        print_status "Генерація Prisma клієнта..."
        npm run db:generate
        
        print_status "Запуск міграцій..."
        npm run db:migrate
        
        print_status "Заповнення тестовими даними..."
        npm run db:seed
        cd ..
        
        print_success "База даних налаштовано"
    else
        print_warning "PostgreSQL не знайдено. Пропускаємо налаштування БД"
        print_status "Ви можете запустити PostgreSQL через Docker:"
        print_status "docker run -d --name cfh-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15"
    fi
}

# Перевірка налаштування
verify_setup() {
    print_status "Перевірка налаштування..."
    
    # Перевірка лінтингу
    print_status "Перевірка лінтингу backend..."
    cd backend
    npm run lint 2>/dev/null || print_warning "Помилки лінтингу в backend"
    cd ..
    
    print_status "Перевірка лінтингу frontend..."
    cd frontend
    npm run lint 2>/dev/null || print_warning "Помилки лінтингу в frontend"
    cd ..
    
    # Перевірка збірки
    print_status "Перевірка збірки backend..."
    cd backend
    npm run build || print_warning "Помилки збірки backend"
    cd ..
    
    print_status "Перевірка збірки frontend..."
    cd frontend
    npm run build || print_warning "Помилки збірки frontend"
    cd ..
    
    print_success "Налаштування перевірено"
}

# Головна функція
main() {
    echo
    print_status "Початок автоматичного налаштування..."
    echo
    
    check_requirements
    echo
    
    install_dependencies  
    echo
    
    setup_environment
    echo
    
    setup_database
    echo
    
    verify_setup
    echo
    
    print_success "🎉 Налаштування завершено успішно!"
    echo
    echo "Наступні кроки:"
    echo "1. Відредагуйте файли .env з вашими налаштуваннями"
    echo "2. Запустіть проєкт: npm run dev"
    echo "3. Відкрийте http://localhost:5173 у браузері"
    echo
    echo "Тестові акаунти:"
    echo "- Адмін: admin@cfh.local / admin123"
    echo "- Менеджер: manager@cfh.local / manager123"
    echo "- Користувач: user@cfh.local / user123"
    echo
    echo "Довідка: cat QUICKSTART.md"
    echo
    
    # Запитати чи запустити проєкт
    echo -n "Запустити проєкт зараз? (y/N): "
    read -r start_now
    if [[ $start_now =~ ^[Yy]$ ]]; then
        print_status "Запуск проєкту..."
        npm run dev
    fi
}

# Обробка помилок
trap 'print_error "Сталася помилка під час налаштування. Перевірте вивід вище."' ERR

# Запуск
main "$@"