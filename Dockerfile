FROM node:20-alpine

WORKDIR /app

# 1. Копируем манифесты зависимостей в корень контейнера
COPY backend/package*.json ./

# 2. Устанавливаем только продакшен-зависимости
RUN npm ci --omit=dev

# 3. Копируем исходники бэкенда прямо в папку backend
COPY backend/ ./backend/

# 4. Копируем файлы фронтенда напрямую в папку frontend
COPY frontend/ ./frontend/

# 5. Указываем порт
ENV PORT=3000
EXPOSE 3000

# 6. Запускаем приложение
CMD ["node", "backend/index.js"]
