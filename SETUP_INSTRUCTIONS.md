# Инструкция по настройке базы данных

## Шаг 1: Удаление старых таблиц

В Supabase SQL Editor выполните:

```sql
-- Удаляем все существующие таблицы
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаляем все функции
DROP FUNCTION IF EXISTS is_admin(BIGINT);
DROP FUNCTION IF EXISTS get_admin_conversations();
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER);
DROP FUNCTION IF EXISTS get_conversations_stats();
DROP FUNCTION IF EXISTS set_current_user(BIGINT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаляем все представления
DROP VIEW IF EXISTS conversation_summary;
```

## Шаг 2: Создание новых таблиц

Выполните содержимое файла `create_tables.sql` в Supabase SQL Editor.

## Шаг 3: Настройка политик безопасности

Выполните содержимое файла `simple_policies.sql` в Supabase SQL Editor.

## Шаг 4: Добавление администратора

1. Откройте файл `add_admin.sql`
2. Замените `YOUR_TELEGRAM_ID` на ваш Telegram ID
3. Замените `'your_username'`, `'Your'`, `'Name'` на ваши данные
4. Выполните скрипт в Supabase SQL Editor

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
SELECT is_admin(YOUR_TELEGRAM_ID) as is_admin;

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
