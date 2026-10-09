# DB Connection Monitor

Full-stack приложение для мониторинга подключения Node.js backend к PostgreSQL.

## Стек

- Node.js 20 Alpine
- Express
- PostgreSQL 16 Alpine
- Docker Compose

## Структура проекта

- `backend/` — Express API и подключение к PostgreSQL
- `frontend/` — статический интерфейс
- `Dockerfile` — сборка образа приложения
- `docker-compose.yml` — приложение, PostgreSQL и постоянное хранилище
- `.env.example` — шаблон переменных окружения

## Настройка

Создай рабочий `.env` на основе шаблона:

```bash
cp .env.example .env
nano .env
