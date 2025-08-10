-- =====================================================
-- ТЕСТОВЫЙ СКРИПТ ДЛЯ ПРОВЕРКИ НАСТРОЙКИ SUPABASE
-- =====================================================

-- Тест 1: Проверка подключения
SELECT 'Тест 1: Подключение к базе данных' as test_name;
SELECT test_connection() as result;

-- Тест 2: Проверка таблиц
SELECT 'Тест 2: Проверка таблиц' as test_name;
SELECT * FROM check_tables();

-- Тест 3: Проверка администраторов
SELECT 'Тест 3: Проверка администраторов' as test_name;
SELECT telegram_id, username, role, is_active FROM admins;

-- Тест 4: Проверка функции is_admin
SELECT 'Тест 4: Проверка функции is_admin' as test_name;
SELECT 
    708907063 as telegram_id,
    is_admin(708907063) as is_admin_1,
    7365307696 as telegram_id_2,
    is_admin(7365307696) as is_admin_2;

-- Тест 5: Проверка политик безопасности
SELECT 'Тест 5: Проверка политик безопасности' as test_name;
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'payments', 'admins')
GROUP BY tablename
ORDER BY tablename;

-- Тест 6: Проверка функций
SELECT 'Тест 6: Проверка функций' as test_name;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'is_admin', 
        'get_admin_conversations', 
        'get_conversation_messages', 
        'get_conversations_stats', 
        'test_connection', 
        'check_tables', 
        'get_conversations_simple'
    )
ORDER BY routine_name;

-- Тест 7: Проверка внешних ключей
SELECT 'Тест 7: Проверка внешних ключей' as test_name;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('conversations', 'messages', 'payments')
ORDER BY tc.table_name, kcu.column_name;

-- Тест 8: Проверка индексов
SELECT 'Тест 8: Проверка индексов' as test_name;
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'payments', 'admins')
ORDER BY tablename, indexname;

-- Тест 9: Проверка RLS
SELECT 'Тест 9: Проверка RLS' as test_name;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'payments', 'admins')
ORDER BY tablename;

-- Тест 10: Создание тестового пользователя и диалога
SELECT 'Тест 10: Тест создания данных' as test_name;

-- Создаем тестового пользователя
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (999999999, 'test_user', 'Test', 'User')
ON CONFLICT (telegram_id) DO NOTHING;

-- Создаем тестовый диалог
INSERT INTO conversations (user_id, status) 
VALUES (999999999, 'open')
ON CONFLICT DO NOTHING;

-- Создаем тестовое сообщение
INSERT INTO messages (conversation_id, sender_id, content, message_type) 
SELECT c.id, 999999999, 'Тестовое сообщение', 'text'
FROM conversations c 
WHERE c.user_id = 999999999 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Проверяем созданные данные
SELECT 
    'Тестовые данные созданы' as status,
    (SELECT COUNT(*) FROM users WHERE telegram_id = 999999999) as users_count,
    (SELECT COUNT(*) FROM conversations WHERE user_id = 999999999) as conversations_count,
    (SELECT COUNT(*) FROM messages m 
     JOIN conversations c ON m.conversation_id = c.id 
     WHERE c.user_id = 999999999) as messages_count;

-- Тест 11: Проверка функции get_admin_conversations
SELECT 'Тест 11: Проверка функции get_admin_conversations' as test_name;
SELECT * FROM get_admin_conversations() LIMIT 5;

-- Тест 12: Проверка функции get_conversations_stats
SELECT 'Тест 12: Проверка функции get_conversations_stats' as test_name;
SELECT * FROM get_conversations_stats();

-- Очистка тестовых данных
SELECT 'Очистка тестовых данных' as cleanup;
DELETE FROM messages WHERE sender_id = 999999999;
DELETE FROM conversations WHERE user_id = 999999999;
DELETE FROM users WHERE telegram_id = 999999999;

SELECT 'Все тесты завершены!' as final_status;
