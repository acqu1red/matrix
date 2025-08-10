# Инструкция по настройке базы данных

## Шаг 1: Полная очистка базы данных

В Supabase SQL Editor выполните содержимое файла `cleanup.sql`.

Этот скрипт удалит:
- Все существующие таблицы
- Все функции (включая старые версии)
- Все представления
- Все триггеры
- Все политики безопасности

## Шаг 2: Создание новых таблиц

Выполните содержимое файла `create_tables.sql` в Supabase SQL Editor.

## Шаг 3: Настройка политик безопасности

Выполните содержимое файла `simple_policies.sql` в Supabase SQL Editor.

## Шаг 4: Добавление администратора

Выполните содержимое файла `add_admin.sql` в Supabase SQL Editor.

**Примечание:** В файле уже указан ваш Telegram ID (708907063) и данные пользователя.

## Шаг 5: Проверка

Выполните в SQL Editor:

```sql
-- Проверка таблиц
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as row_count FROM admins;

-- Проверка функций
SELECT is_admin(708907063) as is_admin;

-- Проверка диалогов (должно быть пусто)
SELECT * FROM get_admin_conversations();
```

## Структура таблиц

### users
- `id` - уникальный идентификатор
- `telegram_id` - ID пользователя в Telegram
- `username` - имя пользователя
- `first_name` - имя
- `last_name` - фамилия
- `created_at` - дата создания
- `updated_at` - дата обновления

### conversations
- `id` - уникальный идентификатор диалога
- `user_id` - ID пользователя
- `admin_id` - ID администратора (может быть NULL)
- `status` - статус: 'open', 'in_progress', 'closed', 'answered'
- `created_at` - дата создания
- `updated_at` - дата обновления

### messages
- `id` - уникальный идентификатор сообщения
- `conversation_id` - ID диалога
- `sender_id` - ID отправителя
- `content` - содержимое сообщения
- `message_type` - тип: 'text', 'file', 'image'
- `is_read` - прочитано ли сообщение
- `created_at` - дата создания

### admins
- `id` - уникальный идентификатор
- `user_id` - ID пользователя-администратора
- `role` - роль: 'admin', 'super_admin'
- `created_at` - дата создания

## Функции

### is_admin(user_telegram_id)
Проверяет, является ли пользователь администратором.

### get_admin_conversations()
Возвращает список всех диалогов для администратора.

### get_conversation_messages(conv_id)
Возвращает сообщения конкретного диалога.

### get_conversations_stats()
Возвращает статистику по диалогам.

## Важные моменты

1. **RLS отключен** - для упрощения тестирования
2. **Все права предоставлены** - anon и authenticated пользователи могут все
3. **Функции с SECURITY DEFINER** - выполняются с правами создателя
4. **Индексы созданы** - для оптимизации запросов

## Устранение проблем

### Проблема: "permission denied"
- Убедитесь, что выполнили `simple_policies.sql`
- Проверьте, что RLS отключен

### Проблема: "function does not exist"
- Убедитесь, что выполнили `create_tables.sql`
- Проверьте, что функции созданы

### Проблема: "admin panel not showing"
- Проверьте, что ваш Telegram ID добавлен в таблицу admins
- Проверьте функцию `is_admin(YOUR_ID)`

### Проблема: "cannot send messages"
- Проверьте, что таблицы созданы правильно
- Проверьте права доступа
- Проверьте консоль браузера на ошибки
