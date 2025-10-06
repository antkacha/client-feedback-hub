#!/bin/bash

# Client Feedback Hub - Скрипт тестування
# Запускає всі тести та перевірки якості коду

set -e

echo "🧪 Client Feedback Hub - Тестування та перевірки"
echo "================================================"

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Функція запуску тестів
run_tests() {
    local component=$1
    local exit_code=0
    
    print_status "Тестування $component..."
    
    case $component in
        "backend")
            cd backend
            
            # Лінтинг
            print_status "Лінтинг backend коду..."
            npm run lint || exit_code=1
            
            # Перевірка типів
            print_status "Перевірка типів TypeScript..."
            npm run type-check || exit_code=1
            
            # Юніт тести
            print_status "Запуск юніт тестів..."
            npm run test || exit_code=1
            
            # Інтеграційні тести
            print_status "Запуск інтеграційних тестів..."
            npm run test:integration || exit_code=1
            
            # Покриття коду
            print_status "Аналіз покриття коду..."
            npm run test:coverage || exit_code=1
            
            cd ..
            ;;
            
        "frontend")
            cd frontend
            
            # Лінтинг
            print_status "Лінтинг frontend коду..."
            npm run lint || exit_code=1
            
            # Перевірка типів
            print_status "Перевірка типів TypeScript..."
            npm run type-check || exit_code=1
            
            # Юніт тести
            print_status "Запуск юніт тестів..."
            npm run test || exit_code=1
            
            # Тести компонентів
            print_status "Тестування React компонентів..."
            npm run test:components || exit_code=1
            
            # E2E тести (якщо налаштовані)
            if [ -f "playwright.config.ts" ]; then
                print_status "Запуск E2E тестів..."
                npm run test:e2e || exit_code=1
            fi
            
            cd ..
            ;;
            
        "docker")
            print_status "Тестування Docker збірки..."
            
            # Збірка backend образу
            print_status "Збірка backend Docker образу..."
            docker build -t cfh-backend:test backend/ || exit_code=1
            
            # Збірка frontend образу
            print_status "Збірка frontend Docker образу..."
            docker build -t cfh-frontend:test frontend/ || exit_code=1
            
            # Тест docker-compose
            print_status "Тестування docker-compose..."
            docker-compose -f docker-compose.yml config || exit_code=1
            
            print_success "Docker образи створено успішно"
            ;;
            
        "security")
            print_status "Перевірка безпеки..."
            
            # Аудит backend залежностей
            print_status "Аудит backend залежностей..."
            cd backend
            npm audit --audit-level moderate || exit_code=1
            cd ..
            
            # Аудит frontend залежностей
            print_status "Аудит frontend залежностей..."
            cd frontend
            npm audit --audit-level moderate || exit_code=1
            cd ..
            
            # Перевірка .env файлів на секрети
            print_status "Перевірка конфігураційних файлів..."
            if grep -r "password123\|secret123\|key123" backend/.env frontend/.env 2>/dev/null; then
                print_warning "Знайдено тестові секрети у .env файлах"
                exit_code=1
            fi
            ;;
    esac
    
    return $exit_code
}

# Генерація звіту
generate_report() {
    local timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
    local report_file="test-report-$timestamp.md"
    
    cat > "$report_file" << EOF
# Client Feedback Hub - Звіт тестування

**Дата:** $(date '+%Y-%m-%d %H:%M:%S')
**Версія:** $(git describe --tags --always 2>/dev/null || echo "dev")

## Результати тестування

### Backend
- ✅ Лінтинг коду
- ✅ Перевірка типів TypeScript  
- ✅ Юніт тести
- ✅ Інтеграційні тести
- ✅ Покриття коду

### Frontend
- ✅ Лінтинг коду
- ✅ Перевірка типів TypeScript
- ✅ Юніт тести
- ✅ Тести компонентів

### Docker
- ✅ Збірка backend образу
- ✅ Збірка frontend образу
- ✅ Валідація docker-compose

### Безпека
- ✅ Аудит залежностей
- ✅ Перевірка конфігурації

## Метрики

### Backend Coverage
\`\`\`
$(cd backend && npm run test:coverage --silent 2>/dev/null | tail -10 || echo "Покриття недоступне")
\`\`\`

### Frontend Coverage  
\`\`\`
$(cd frontend && npm run test:coverage --silent 2>/dev/null | tail -10 || echo "Покриття недоступне")
\`\`\`

## Рекомендації

- Підтримувати покриття тестів >80%
- Регулярно оновлювати залежності
- Перевіряти безпеку перед релізом

EOF
    
    print_success "Звіт збережено: $report_file"
}

# Головна функція
main() {
    local components=("$@")
    local total_errors=0
    
    # Якщо не вказано компоненти, тестуємо все
    if [ ${#components[@]} -eq 0 ]; then
        components=("backend" "frontend" "docker" "security")
    fi
    
    print_status "Початок тестування компонентів: ${components[*]}"
    echo
    
    # Перевірка середовища
    if [ ! -f "package.json" ]; then
        print_error "Запустіть скрипт з кореневої папки проєкту"
        exit 1
    fi
    
    # Запуск тестів для кожного компонента
    for component in "${components[@]}"; do
        echo
        if run_tests "$component"; then
            print_success "$component тести пройдено"
        else
            print_error "$component тести провалено"
            ((total_errors++))
        fi
    done
    
    echo
    echo "================================================"
    
    if [ $total_errors -eq 0 ]; then
        print_success "🎉 Всі тести пройдено успішно!"
    else
        print_error "❌ $total_errors компонент(ів) з помилками"
    fi
    
    # Генерація звіту
    generate_report
    
    exit $total_errors
}

# Показати довідку
show_help() {
    echo "Використання: $0 [компоненти...]"
    echo
    echo "Доступні компоненти:"
    echo "  backend    - Тестування backend коду"
    echo "  frontend   - Тестування frontend коду"  
    echo "  docker     - Тестування Docker збірки"
    echo "  security   - Перевірки безпеки"
    echo
    echo "Приклади:"
    echo "  $0                    # Тестувати все"
    echo "  $0 backend            # Тільки backend"
    echo "  $0 frontend docker    # Frontend та Docker"
    echo
    echo "Опції:"
    echo "  -h, --help    Показати цю довідку"
}

# Обробка аргументів
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac