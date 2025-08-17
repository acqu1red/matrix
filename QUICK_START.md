# 🚀 Быстрый старт Context7 MCP

## Установка и настройка за 2 минуты

### 1. Проверка системы
```bash
node --version  # Должен быть v18+
```

### 2. Запуск сервера
```bash
./start-context7.sh
```

### 3. Настройка в AI-ассистенте

#### Для Cursor/VS Code:
1. Откройте настройки (Cmd/Ctrl + ,)
2. Найдите "MCP" или "Model Context Protocol"
3. Добавьте конфигурацию из `mcp-config.json`

#### Для GitHub Copilot:
1. Repository → Settings → Copilot → Coding agent → MCP configuration
2. Добавьте:
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "tools": ["get-library-docs", "resolve-library-id"]
    }
  }
}
```

### 4. Использование

В AI-ассистенте введите:
```
use context7
implement basic authentication with supabase
```

### 5. Примеры запросов

```
use context7
- "show me React hooks examples"
- "how to use Next.js routing"
- "MongoDB connection examples"
- "Supabase authentication setup"
- "Express.js middleware tutorial"
```

## Автоматическое использование

Файл `.windsurfrules` уже настроен для автоматического использования Context7 при запросах о:
- Коде и примерах
- Библиотеках и фреймворках
- Документации и туториалах
- Настройке и конфигурации

## Устранение проблем

### Ошибка "Module Not Found"
```bash
bunx @upstash/context7-mcp
```

### Проблемы с портом
Измените порт в `start-context7.sh`:
```bash
npx @upstash/context7-mcp --transport http --port 3002
```

### Проверка работы
```bash
curl http://localhost:3001/health
```

## Полезные ссылки

- [Официальная документация](https://github.com/upstash/context7)
- [Поддерживаемые библиотеки](https://context7.com)
- [Discord сообщество](https://discord.gg/context7)
