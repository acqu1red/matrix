# Context7 MCP Server - Настройка и использование

## Что такое Context7?

Context7 - это MCP (Model Context Protocol) сервер, который предоставляет актуальную документацию по библиотекам и API для AI-ассистентов. Это позволяет получать свежую документацию прямо в чате с AI.

## Установка в различных средах

### VS Code / Cursor

1. Откройте настройки (Settings)
2. Найдите раздел "MCP" или "Model Context Protocol"
3. Добавьте конфигурацию из файла `mcp-config.json`

### GitHub Copilot Coding Agent

1. Перейдите в Repository → Settings → Copilot → Coding agent → MCP configuration
2. Добавьте конфигурацию:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "tools": ["get-library-docs", "resolve-library-id"]
    }
  }
}
```

### LM Studio

1. Перейдите в Program (правая сторона) → Install → Edit mcp.json
2. Вставьте конфигурацию из `mcp-config.json`
3. Сохраните и включите MCP сервер

### Perplexity Desktop

1. Перейдите в Perplexity → Settings → Connectors
2. Нажмите Add Connector → Advanced
3. Введите Server Name: `Context7`
4. Вставьте JSON конфигурацию:

```json
{
  "args": ["-y", "@upstash/context7-mcp"],
  "command": "npx",
  "env": {}
}
```

## Доступные инструменты

Context7 предоставляет два основных инструмента:

### 1. `resolve-library-id`
Разрешает общее название библиотеки в Context7-совместимый ID.

**Параметры:**
- `libraryName` (обязательный): Название библиотеки для поиска

### 2. `get-library-docs`
Получает документацию для библиотеки по Context7-совместимому ID.

**Параметры:**
- `context7CompatibleLibraryID` (обязательный): Точный Context7-совместимый ID (например, `/mongodb/docs`, `/vercel/next.js`)
- `topic` (опциональный): Фокусирует документацию на конкретной теме (например, "routing", "hooks")
- `tokens` (опциональный, по умолчанию 10000): Максимальное количество токенов для возврата

## Примеры использования

### Базовое использование
```
use context7
implement basic authentication with supabase
```

### Прямое указание библиотеки
```
implement basic authentication with supabase. use library /supabase/supabase for api and docs
```

### Фокусировка на теме
```
get documentation for React hooks, use library /facebook/react
```

## Автоматическое использование

Чтобы не добавлять `use context7` к каждому запросу, можно создать правило в `.windsurfrules` (Windsurf) или в настройках Cursor:

```
[[calls]]
match = "when the user requests code examples, setup or configuration steps, or library/API documentation"
tool  = "context7"
```

## Устранение неполадок

### Ошибки "Module Not Found"
Попробуйте использовать `bunx` вместо `npx`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "bunx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### Проблемы с ESM
Добавьте флаг `--experimental-vm-modules`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "--node-options=--experimental-vm-modules", "@upstash/context7-mcp@1.0.6"]
    }
  }
}
```

### Проблемы с TLS/сертификатами
Используйте флаг `--experimental-fetch`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "--node-options=--experimental-fetch", "@upstash/context7-mcp"]
    }
  }
}
```

## Полезные ссылки

- [Официальный репозиторий](https://github.com/upstash/context7)
- [Веб-сайт Context7](https://context7.com)
- [Discord сообщество](https://discord.gg/context7)

## Поддерживаемые библиотеки

Context7 поддерживает множество популярных библиотек:
- React, Vue, Angular
- Node.js, Express, Fastify
- Python: Django, Flask, FastAPI
- Database: MongoDB, PostgreSQL, Redis
- Cloud: AWS, Vercel, Netlify
- И многие другие...

## Безопасность

Context7 проекты создаются сообществом. Хотя мы стремимся поддерживать высокое качество, мы не можем гарантировать точность, полноту или безопасность всей документации библиотек. Если вы обнаружите подозрительный, неприемлемый или потенциально вредоносный контент, используйте кнопку "Report" на странице проекта.
