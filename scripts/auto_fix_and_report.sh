#!/bin/bash

# =============================================================================
# Auto Fix and Report Script для Client Feedback Hub
# Автоматично виправляє код та генерує звіт про результати
# =============================================================================

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Файл для звіту
REPORT_FILE="/tmp/test-report.txt"
LOG_FILE="/tmp/auto-fix.log"

# Функція для логування з кольором
log() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ${message}" >> "$LOG_FILE"
}

# Функція для перевірки статусу виходу
check_status() {
    local status=$1
    local operation=$2
    
    if [ $status -eq 0 ]; then
        log $GREEN "✅ $operation - УСПІШНО"
        echo "✅ $operation - УСПІШНО" >> "$REPORT_FILE"
        return 0
    else
        log $RED "❌ $operation - ПРОВАЛ"
        echo "❌ $operation - ПРОВАЛ" >> "$REPORT_FILE"
        return 1
    fi
}

# Функція для створення резервної копії
create_backup() {
    local backup_dir="./backup-$(date +%Y%m%d-%H%M%S)"
    log $BLUE "📦 Створення резервної копії в $backup_dir"
    
    # Створюємо папку для backup
    mkdir -p "$backup_dir"
    
    # Копіюємо важливі файли
    cp -r frontend/src "$backup_dir/frontend-src" 2>/dev/null || true
    cp -r server/src "$backup_dir/server-src" 2>/dev/null || true
    
    echo "Резервна копія створена: $backup_dir" >> "$REPORT_FILE"
    log $GREEN "✅ Резервна копія створена"
}

# Головна функція
main() {
    log $CYAN "🚀 Початок автоматичного виправлення коду..."
    
    # Очищаємо попередні файли звітів
    > "$REPORT_FILE"
    > "$LOG_FILE"
    
    echo "=== AUTO FIX AND REPORT ===" >> "$REPORT_FILE"
    echo "Час запуску: $(date)" >> "$REPORT_FILE"
    echo "Проект: Client Feedback Hub" >> "$REPORT_FILE"
    echo "=============================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Створюємо резервну копію
    create_backup
    
    # =============================================================================
    # КРОК 1: ESLint автофікс
    # =============================================================================
    
    log $YELLOW "🔧 КРОК 1: Запуск ESLint автофіксу..."
    echo "" >> "$REPORT_FILE"
    echo "1. ESLint Автофікс:" >> "$REPORT_FILE"
    
    npm run lint:fix >> "$LOG_FILE" 2>&1
    local lint_status=$?
    
    if check_status $lint_status "ESLint автофікс"; then
        # Якщо ESLint пройшов, перевіряємо чи залишились помилки
        log $BLUE "🔍 Перевірка залишкових помилок ESLint..."
        npm run lint >> "$LOG_FILE" 2>&1
        local lint_check_status=$?
        
        if [ $lint_check_status -eq 0 ]; then
            log $GREEN "✨ ESLint: Всі помилки виправлено!"
            echo "   ✨ Всі помилки виправлено" >> "$REPORT_FILE"
        else
            log $YELLOW "⚠️ ESLint: Залишились помилки які потребують ручного виправлення"
            echo "   ⚠️ Залишились помилки які потребують ручного виправлення" >> "$REPORT_FILE"
        fi
    fi
    
    # =============================================================================
    # КРОК 2: Prettier форматування
    # =============================================================================
    
    log $YELLOW "💅 КРОК 2: Запуск Prettier форматування..."
    echo "" >> "$REPORT_FILE"
    echo "2. Prettier Форматування:" >> "$REPORT_FILE"
    
    npm run format >> "$LOG_FILE" 2>&1
    local format_status=$?
    
    if check_status $format_status "Prettier форматування"; then
        # Перевіряємо чи все відформатовано правильно
        log $BLUE "🔍 Перевірка форматування..."
        npm run format:check >> "$LOG_FILE" 2>&1
        local format_check_status=$?
        
        if [ $format_check_status -eq 0 ]; then
            log $GREEN "✨ Prettier: Код відформатовано правильно!"
            echo "   ✨ Код відформатовано правильно" >> "$REPORT_FILE"
        else
            log $YELLOW "⚠️ Prettier: Деякі файли не відповідають стилю форматування"
            echo "   ⚠️ Деякі файли не відповідають стилю форматування" >> "$REPORT_FILE"
        fi
    fi
    
    # =============================================================================
    # КРОК 3: TypeScript перевірка
    # =============================================================================
    
    log $YELLOW "🔧 КРОК 3: Запуск TypeScript перевірки..."
    echo "" >> "$REPORT_FILE"
    echo "3. TypeScript Type Check:" >> "$REPORT_FILE"
    
    npm run typecheck >> "$LOG_FILE" 2>&1
    local typecheck_status=$?
    
    if check_status $typecheck_status "TypeScript перевірка"; then
        log $GREEN "✨ TypeScript: Всі типи корректні!"
        echo "   ✨ Всі типи корректні" >> "$REPORT_FILE"
    else
        log $RED "💥 TypeScript: Знайдено помилки типів!"
        echo "   💥 Знайдено помилки типів (див. лог файл)" >> "$REPORT_FILE"
        
        # Додаємо помилки типів до звіту
        echo "" >> "$REPORT_FILE"
        echo "   Помилки TypeScript:" >> "$REPORT_FILE"
        npm run typecheck 2>&1 | tail -20 >> "$REPORT_FILE"
    fi
    
    # =============================================================================
    # КРОК 4: Запуск тестів
    # =============================================================================
    
    log $YELLOW "🧪 КРОК 4: Запуск unit тестів..."
    echo "" >> "$REPORT_FILE"
    echo "4. Unit Tests:" >> "$REPORT_FILE"
    
    # Запускаємо тести в CI режимі (без watch)
    npm run test:ci >> "$LOG_FILE" 2>&1
    local test_status=$?
    
    if check_status $test_status "Unit тести"; then
        log $GREEN "✨ Тести: Всі тести пройшли!"
        echo "   ✨ Всі тести пройшли" >> "$REPORT_FILE"
        
        # Додаємо статистику тестів
        echo "" >> "$REPORT_FILE"
        echo "   Статистика тестів:" >> "$REPORT_FILE"
        npm run test:ci 2>&1 | grep -E "(Tests:|Suites:|Time:|Coverage:)" >> "$REPORT_FILE" || true
    else
        log $RED "💥 Тести: Деякі тести провалились!"
        echo "   💥 Деякі тести провалились" >> "$REPORT_FILE"
        
        # Додаємо інформацію про провалені тести
        echo "" >> "$REPORT_FILE"
        echo "   Провалені тести:" >> "$REPORT_FILE"
        npm run test:ci 2>&1 | grep -A 5 -B 5 "FAIL\|FAILED" >> "$REPORT_FILE" || true
    fi
    
    # =============================================================================
    # КРОК 5: Генерація фінального звіту
    # =============================================================================
    
    log $PURPLE "📊 КРОК 5: Генерація фінального звіту..."
    
    # Рахуємо загальний статус
    local total_errors=0
    if [ $lint_status -ne 0 ]; then ((total_errors++)); fi
    if [ $format_status -ne 0 ]; then ((total_errors++)); fi
    if [ $typecheck_status -ne 0 ]; then ((total_errors++)); fi
    if [ $test_status -ne 0 ]; then ((total_errors++)); fi
    
    echo "" >> "$REPORT_FILE"
    echo "=============================" >> "$REPORT_FILE"
    echo "ПІДСУМОК:" >> "$REPORT_FILE"
    echo "=============================" >> "$REPORT_FILE"
    echo "Час завершення: $(date)" >> "$REPORT_FILE"
    echo "Загальна кількість помилок: $total_errors" >> "$REPORT_FILE"
    
    if [ $total_errors -eq 0 ]; then
        log $GREEN "🎉 ВСІ ПЕРЕВІРКИ ПРОЙШЛИ УСПІШНО!"
        echo "Статус: ✅ ВСЕ ДОБРЕ - готовно до коміту!" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "📋 Рекомендації:" >> "$REPORT_FILE"
        echo "• Можете робити commit та push" >> "$REPORT_FILE"
        echo "• Код відповідає всім стандартам проекту" >> "$REPORT_FILE"
    else
        log $RED "⚠️ ЗНАЙДЕНО ПРОБЛЕМИ - ПОТРІБНЕ РУЧНЕ ВИПРАВЛЕННЯ"
        echo "Статус: ⚠️ ПОТРІБНІ ВИПРАВЛЕННЯ" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "📋 Рекомендації:" >> "$REPORT_FILE"
        echo "• Перегляньте помилки вище" >> "$REPORT_FILE"
        echo "• Виправте помилки вручну" >> "$REPORT_FILE"
        echo "• Запустіть скрипт повторно" >> "$REPORT_FILE"
        echo "• При потребі відкатіться до backup версії" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "📁 Файли логів:" >> "$REPORT_FILE"
    echo "• Детальний лог: $LOG_FILE" >> "$REPORT_FILE"
    echo "• Звіт: $REPORT_FILE" >> "$REPORT_FILE"
    
    # Виводимо звіт в консоль
    log $CYAN "📄 ЗВІТ СТВОРЕНО: $REPORT_FILE"
    log $BLUE "📋 Показую звіт:"
    echo ""
    cat "$REPORT_FILE"
    
    # Повертаємо код виходу
    if [ $total_errors -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Функція для показу допомоги
show_help() {
    echo "Використання: $0 [опції]"
    echo ""
    echo "Опції:"
    echo "  -h, --help     Показати цю довідку"
    echo "  -v, --verbose  Детальний вивід"
    echo "  --no-backup    Не створювати резервну копію"
    echo "  --only-lint    Тільки лінтинг та форматування"
    echo "  --only-test    Тільки тести"
    echo ""
    echo "Приклади:"
    echo "  $0                 # Повна перевірка та виправлення"
    echo "  $0 --only-lint     # Тільки лінтинг"
    echo "  $0 --no-backup     # Без резервної копії"
}

# Обробка аргументів командного рядка
VERBOSE=false
NO_BACKUP=false
ONLY_LINT=false
ONLY_TEST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --only-lint)
            ONLY_LINT=true
            shift
            ;;
        --only-test)
            ONLY_TEST=true
            shift
            ;;
        *)
            echo "Невідома опція: $1"
            show_help
            exit 1
            ;;
    esac
done

# Перевіряємо чи ми в правильній директорії
if [ ! -f "package.json" ]; then
    log $RED "❌ Помилка: Запустіть скрипт з кореневої директорії проекту"
    exit 1
fi

# Запускаємо головну функцію
main