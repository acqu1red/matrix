#!/bin/bash

# Скрипт для запуска Context7 MCP сервера
echo "🚀 Запуск Context7 MCP сервера..."

# Проверяем, что Node.js установлен
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js v18+"
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js v18+. Текущая версия: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) найден"

# Запускаем Context7 MCP сервер
echo "🌐 Запуск Context7 MCP сервера на порту 3001..."
echo "📖 Документация: https://github.com/upstash/context7"
echo "🔧 Конфигурация: mcp-config.json"
echo ""
echo "Для использования в AI-ассистенте:"
echo "1. Добавьте конфигурацию из mcp-config.json в настройки"
echo "2. Используйте команду: use context7"
echo "3. Задайте вопрос о библиотеке или фреймворке"
echo ""
echo "Нажмите Ctrl+C для остановки сервера"
echo ""

npx @upstash/context7-mcp --transport http --port 3001
