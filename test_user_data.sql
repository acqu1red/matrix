-- Тестовый скрипт для проверки данных пользователей
-- Выполните в Supabase SQL Editor

SET search_path TO public;

-- 1. Проверяем данные пользователей
SELECT '=== ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ ===' as info;

SELECT 
    telegram_id,
    username,
    first_name,
    last_name,
    CASE 
        WHEN username IS NOT NULL AND username != '' THEN username
        WHEN first_name IS NOT NULL AND first_name != '' THEN first_name
        ELSE CONCAT('Пользователь #', telegram_id)::VARCHAR(255)
    END as display_name
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Тестируем функцию test_user_display
SELECT '=== ТЕСТ ФУНКЦИИ test_user_display ===' as info;
SELECT * FROM test_user_display();

-- 3. Тестируем функцию get_admin_conversations
SELECT '=== ТЕСТ ФУНКЦИИ get_admin_conversations ===' as info;
SELECT 
    id,
    user_id,
    username,
    message_count,
    last_message
FROM get_admin_conversations()
LIMIT 5;

-- 4. Проверяем количество сообщений в диалогах
SELECT '=== КОЛИЧЕСТВО СООБЩЕНИЙ В ДИАЛОГАХ ===' as info;
SELECT 
    c.id,
    c.user_id,
    u.username,
    u.first_name,
    COUNT(m.id) as message_count
FROM conversations c
JOIN users u ON c.user_id = u.telegram_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.user_id, u.username, u.first_name
ORDER BY c.created_at DESC
LIMIT 10;
