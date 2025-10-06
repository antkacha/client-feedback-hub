#!/bin/bash

# Client Feedback Hub - Скрипт деплою
# Автоматизує процес деплою на різні середовища

set -e

echo "🚀 Client Feedback Hub - Деплой"
echo "================================"

# Конфігурація
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
IMAGE_PREFIX="${IMAGE_PREFIX:-cfh}"
VERSION="${VERSION:-$(git describe --tags --always 2>/dev/null || echo 'latest')}"

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
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

# Функція збірки образів
build_images() {
    local environment=$1
    
    print_status "Збірка Docker образів для $environment..."
    
    # Збірка backend
    print_status "Збірка backend образу..."
    docker build \
        --build-arg NODE_ENV=$environment \
        --tag $DOCKER_REGISTRY/$IMAGE_PREFIX-backend:$VERSION \
        --tag $DOCKER_REGISTRY/$IMAGE_PREFIX-backend:latest \
        backend/
    
    # Збірка frontend
    print_status "Збірка frontend образу..."
    docker build \
        --build-arg NODE_ENV=$environment \
        --tag $DOCKER_REGISTRY/$IMAGE_PREFIX-frontend:$VERSION \
        --tag $DOCKER_REGISTRY/$IMAGE_PREFIX-frontend:latest \
        frontend/
    
    print_success "Образи зібрано успішно"
}

# Функція публікації образів
push_images() {
    print_status "Публікація образів у реєстр..."
    
    # Backend
    docker push $DOCKER_REGISTRY/$IMAGE_PREFIX-backend:$VERSION
    docker push $DOCKER_REGISTRY/$IMAGE_PREFIX-backend:latest
    
    # Frontend
    docker push $DOCKER_REGISTRY/$IMAGE_PREFIX-frontend:$VERSION
    docker push $DOCKER_REGISTRY/$IMAGE_PREFIX-frontend:latest
    
    print_success "Образи опубліковано"
}

# Деплой на локальне середовище
deploy_local() {
    print_status "Деплой на локальне середовище..."
    
    # Зупинка поточних контейнерів
    docker-compose down 2>/dev/null || true
    
    # Запуск з новими образами
    docker-compose up -d
    
    # Очікування готовності
    print_status "Очікування готовності сервісів..."
    sleep 10
    
    # Перевірка здоров'я
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        print_success "Backend доступний на http://localhost:3000"
    else
        print_warning "Backend не відповідає"
    fi
    
    if curl -f http://localhost:5173 >/dev/null 2>&1; then
        print_success "Frontend доступний на http://localhost:5173"
    else
        print_warning "Frontend не відповідає"
    fi
}

# Деплой на staging
deploy_staging() {
    print_status "Деплой на staging середовище..."
    
    # TODO: Налаштувати staging деплой
    print_warning "Staging деплой ще не налаштований"
    print_status "Для налаштування:"
    print_status "1. Налаштуйте Kubernetes кластер або Docker Swarm"
    print_status "2. Створіть staging конфігурацію"
    print_status "3. Налаштуйте CI/CD pipeline"
}

# Деплой на production
deploy_production() {
    print_status "Деплой на production середовище..."
    
    # Підтвердження
    echo -n "Ви впевнені, що хочете задеплоїти на production? (yes/no): "
    read -r confirmation
    if [ "$confirmation" != "yes" ]; then
        print_status "Деплой скасовано"
        exit 0
    fi
    
    # Перевірка тегу версії
    if [ "$VERSION" = "latest" ]; then
        print_error "Для production деплою потрібен конкретний тег версії"
        print_status "Створіть тег: git tag v1.0.0 && git push origin v1.0.0"
        exit 1
    fi
    
    # TODO: Налаштувати production деплой
    print_warning "Production деплой ще не налаштований"
    print_status "Для налаштування:"
    print_status "1. Налаштуйте production кластер"
    print_status "2. Створіть production конфігурацію"
    print_status "3. Налаштуйте моніторинг та логування"
    print_status "4. Створіть backup стратегію"
}

# Роллбек деплою
rollback_deployment() {
    local environment=$1
    local version=$2
    
    print_status "Роллбек до версії $version на $environment..."
    
    case $environment in
        "local")
            # Локальний роллбек
            VERSION=$version docker-compose up -d
            ;;
        "staging"|"production")
            print_warning "Роллбек для $environment ще не налаштований"
            ;;
    esac
    
    print_success "Роллбек завершено"
}

# Перевірка здоров'я після деплою
health_check() {
    local environment=$1
    
    print_status "Перевірка здоров'я $environment..."
    
    case $environment in
        "local")
            local backend_url="http://localhost:3000"
            local frontend_url="http://localhost:5173"
            ;;
        "staging")
            local backend_url="https://api-staging.cfh.example.com"
            local frontend_url="https://staging.cfh.example.com"
            ;;
        "production")
            local backend_url="https://api.cfh.example.com"
            local frontend_url="https://cfh.example.com"
            ;;
    esac
    
    # Перевірка backend
    if curl -f "$backend_url/api/health" >/dev/null 2>&1; then
        print_success "✅ Backend healthy"
    else
        print_error "❌ Backend unhealthy"
        return 1
    fi
    
    # Перевірка frontend
    if curl -f "$frontend_url" >/dev/null 2>&1; then
        print_success "✅ Frontend healthy"
    else
        print_error "❌ Frontend unhealthy"
        return 1
    fi
    
    # Перевірка бази даних (тільки для backend)
    if curl -f "$backend_url/api/health/db" >/dev/null 2>&1; then
        print_success "✅ Database healthy"
    else
        print_error "❌ Database unhealthy"
        return 1
    fi
    
    print_success "Всі сервіси працюють нормально"
}

# Резервне копіювання бази даних
backup_database() {
    local environment=$1
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="backup_${environment}_${timestamp}.sql"
    
    print_status "Створення резервної копії БД для $environment..."
    
    case $environment in
        "local")
            pg_dump client_feedback_hub > "backups/$backup_file"
            ;;
        "staging"|"production")
            print_warning "Backup для $environment потрібно налаштувати"
            ;;
    esac
    
    print_success "Backup збережено: $backup_file"
}

# Показати статус деплою
show_status() {
    local environment=${1:-"local"}
    
    print_status "Статус $environment середовища:"
    echo
    
    case $environment in
        "local")
            echo "Docker контейнери:"
            docker-compose ps
            echo
            echo "Образи:"
            docker images | grep cfh || echo "Немає образів CFH"
            ;;
        *)
            print_warning "Статус для $environment не налаштований"
            ;;
    esac
}

# Показати логи
show_logs() {
    local environment=${1:-"local"}
    local service=${2:-""}
    
    print_status "Логи $environment${service:+ сервісу $service}:"
    
    case $environment in
        "local")
            if [ -n "$service" ]; then
                docker-compose logs -f "$service"
            else
                docker-compose logs -f
            fi
            ;;
        *)
            print_warning "Логи для $environment не налаштовані"
            ;;
    esac
}

# Показати довідку
show_help() {
    echo "Використання: $0 <команда> [параметри]"
    echo
    echo "Команди:"
    echo "  build <env>           Зібрати образи для середовища"
    echo "  push                  Опублікувати образи у реєстр"
    echo "  deploy <env>          Задеплоїти на середовище"
    echo "  rollback <env> <ver>  Відкотити до версії"
    echo "  health <env>          Перевірити здоров'я"
    echo "  backup <env>          Створити backup БД"
    echo "  status [env]          Показати статус"
    echo "  logs [env] [service]  Показати логи"
    echo
    echo "Середовища:"
    echo "  local        Локальна розробка"
    echo "  staging      Тестове середовище"
    echo "  production   Боєве середовище"
    echo
    echo "Змінні середовища:"
    echo "  DOCKER_REGISTRY   Реєстр образів (за замовчуванням: ghcr.io)"
    echo "  IMAGE_PREFIX      Префікс образів (за замовчуванням: cfh)"
    echo "  VERSION           Версія для деплою (за замовчуванням: git describe)"
    echo
    echo "Приклади:"
    echo "  $0 build local"
    echo "  $0 deploy staging"
    echo "  $0 rollback production v1.2.0"
    echo "  $0 logs local backend"
}

# Головна функція
main() {
    local command=${1:-}
    
    case $command in
        "build")
            build_images "${2:-local}"
            ;;
        "push")
            push_images
            ;;
        "deploy")
            local env=${2:-local}
            case $env in
                "local")
                    deploy_local
                    ;;
                "staging")
                    deploy_staging
                    ;;
                "production")
                    deploy_production
                    ;;
                *)
                    print_error "Невідоме середовище: $env"
                    exit 1
                    ;;
            esac
            ;;
        "rollback")
            rollback_deployment "${2:-local}" "${3:-latest}"
            ;;
        "health")
            health_check "${2:-local}"
            ;;
        "backup")
            backup_database "${2:-local}"
            ;;
        "status")
            show_status "${2:-local}"
            ;;
        "logs")
            show_logs "${2:-local}" "${3:-}"
            ;;
        "-h"|"--help"|"help")
            show_help
            ;;
        "")
            print_error "Не вказана команда"
            show_help
            exit 1
            ;;
        *)
            print_error "Невідома команда: $command"
            show_help
            exit 1
            ;;
    esac
}

# Створення папки для backup
mkdir -p backups

# Запуск
main "$@"