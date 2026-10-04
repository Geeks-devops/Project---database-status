# DB Connection Monitor

Full-stack приложение для мониторинга подключения бэкенда к PostgreSQL в реальном времени.

## Структура проекта

```
db-status-app/
├── backend/
│   ├── index.js        # Express сервер + pg клиент + раздача frontend
│   ├── package.json
│   ├── .env            # переменные окружения (не коммитить!)
│   └── .gitignore
└── frontend/
    └── index.html      # UI — раздаётся самим Node.js
```

> Nginx не используется. Бэкенд сам раздаёт фронтенд через `express.static`.

## Требования

- Node.js >= 18
- npm >= 9
- PostgreSQL (локальный или удалённый)

Проверить версии:
```bash
node -v
npm -v
```

---

## 1. Настройка переменных окружения

Открой файл `backend/.env` и заполни свои данные:

```dotenv
# PostgreSQL connection
DB_HOST=localhost       # адрес сервера БД
DB_PORT=5432            # порт PostgreSQL (по умолчанию 5432)
DB_NAME=postgres        # имя базы данных
DB_USER=postgres        # пользователь БД
DB_PASSWORD=secret      # пароль пользователя

# Express server
PORT=3001               # порт бэкенда
```

> ⚠️ Файл `.env` уже добавлен в `.gitignore` — он не попадёт в репозиторий.

---

## 2. Установка зависимостей

```bash
cd db-status-app/backend
npm install
```

---

## 3. Запуск бэкенда

```bash
npm start
```

Ожидаемый вывод:
```
Backend running on http://localhost:3001
DB: localhost:5432/postgres
```

### Режим разработки (авто-перезапуск при изменениях)

```bash
npm run dev
```

---

## 4. Открыть фронтенд

После запуска бэкенда открой в браузере:

```
http://localhost:3001
```

Бэкенд сам раздаёт `frontend/index.html` — отдельно открывать файл не нужно.

---

## API эндпоинты

| Метод | URL | Описание |
|-------|-----|---------|
| `GET` | `/health` | Статус бэкенда + uptime |
| `GET` | `/api/db-status` | Разовая проверка подключения к БД |
| `GET` | `/api/db-status/stream` | SSE стрим, обновление каждые 5 сек |

### Пример ответа `/api/db-status`

**Подключено:**
```json
{
  "connected": true,
  "latency_ms": 3,
  "db_version": "PostgreSQL 16.2 on x86_64-pc-linux-gnu...",
  "host": "localhost",
  "port": "5432",
  "database": "postgres",
  "user": "postgres"
}
```

**Не подключено:**
```json
{
  "connected": false,
  "latency_ms": 3002,
  "error": "connect ECONNREFUSED 127.0.0.1:5432",
  "host": "localhost",
  "port": "5432",
  "database": "postgres",
  "user": "postgres"
}
```

---

## Возможные ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `ECONNREFUSED` | PostgreSQL не запущен | `sudo systemctl start postgresql` |
| `password authentication failed` | Неверный пароль | Проверить `DB_PASSWORD` в `.env` |
| `database does not exist` | Указана несуществующая БД | Проверить `DB_NAME` в `.env` |
| `Backend Unreachable` (в браузере) | Бэкенд не запущен | Запустить `npm start` |
| CORS error в браузере | Запрос заблокирован | Убедиться, что бэкенд запущен на `localhost:3001` |

---

## Деплой на сервер (CI/CD)

### Структура для деплоя

```
db-status-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions пайплайн
└── backend/
    ├── db-status-app.service   # systemd unit
    ├── start.sh                # entrypoint для systemd
    └── .env.example            # шаблон переменных (без секретов)
```

### 1. Подготовка сервера

```bash
# Клонировать репозиторий
git clone <repo-url> /var/www/db-status-app

# Создать .env из шаблона и заполнить
cp /var/www/db-status-app/backend/.env.example /var/www/db-status-app/backend/.env
nano /var/www/db-status-app/backend/.env

# Сделать start.sh исполняемым
chmod +x /var/www/db-status-app/backend/start.sh

# Установить systemd сервис
cp /var/www/db-status-app/backend/db-status-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable db-status-app
systemctl start db-status-app

# Проверить статус
systemctl status db-status-app
```

### 2. GitHub Secrets

В репозитории → **Settings → Secrets and variables → Actions** добавить:

| Secret | Значение |
|--------|---------|
| `TAILSCALE_AUTHKEY` | Auth key из Tailscale Admin Console |
| `SSH_HOST` | Tailscale IP сервера |
| `SSH_USER` | Пользователь SSH (например, `root`) |
| `SSH_KEY` | Приватный SSH ключ |

### 3. Как работает пайплайн

```
push → main
  └── Checkout Code
  └── Connect to Tailscale      # VPN туннель к серверу
  └── SSH → сервер
        ├── git pull origin main
        ├── npm install --production
        └── systemctl restart db-status-app
```

Пайплайн запускается автоматически при пуше в `main` или вручную через **Actions → Run workflow**.
