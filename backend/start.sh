#!/bin/bash
# Entrypoint для запуска Backend-сервиса

# Переходим в директорию скрипта
cd "$(dirname "$0")"

echo "Установка зависимостей Node.js..."
npm install --production

echo "Запуск бэкенда..."
npm start
