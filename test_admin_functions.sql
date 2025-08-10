-- Тестовый скрипт для проверки работы функций админ панели
-- Выполните в Supabase SQL Editor для диагностики

SET search_path TO public;

-- 1. Проверяем данные в таблицах
SELECT '=== ПРОВЕРКА ДАННЫХ В ТАБЛИЦАХ ===' as info;

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'conversations' as table_name, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as count FROM messages;

-- 2. Проверяем данные пользователей
SELECT '=== ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ ===' as info;
SELECT 
    telegram_id,
    username,
    first_name,
    last_name,
    is_admin,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Проверяем диалоги
SELECT '=== ДАННЫЕ ДИАЛОГОВ ===' as info;
SELECT 
    c.id,
    c.user_id,
    c.status,
    c.created_at,
    c.last_message_at,
    u.username,
    u.first_name,
    u.last_name
FROM conversations c
LEFT JOIN users u ON c.user_id = u.telegram_id
ORDER BY c.created_at DESC
LIMIT 10;

-- 4. Проверяем сообщения
SELECT '=== ДАННЫЕ СООБЩЕНИЙ ===' as info;
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.created_at,
    u.username,
    u.first_name
FROM messages m
LEFT JOIN users u ON m.sender_id = u.telegram_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 5. Тестируем функцию get_admin_conversations
SELECT '=== ТЕСТ ФУНКЦИИ get_admin_conversations ===' as info;
SELECT * FROM get_admin_conversations()
LIMIT 5;

-- 6. Тестируем функцию get_conversations_stats
SELECT '=== ТЕСТ ФУНКЦИИ get_conversations_stats ===' as info;
SELECT * FROM get_conversations_stats();

-- 7. Проверяем права на функции
SELECT '=== ПРОВЕРКА ПРАВ НА ФУНКЦИИ ===' as info;
SELECT 
    proname as function_name,
    proacl as permissions
FROM pg_proc 
WHERE proname IN ('get_admin_conversations', 'get_conversation_messages', 'get_conversations_stats')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
