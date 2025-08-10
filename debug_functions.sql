-- Отладочные функции для проверки работы RPC
-- Выполните в Supabase SQL Editor

SET search_path TO public;

-- Простая тестовая функция
CREATE OR REPLACE FUNCTION test_connection()
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 'Connection OK - ' || current_timestamp::text;
$$;

-- Простая функция для получения диалогов (без JOIN)
CREATE OR REPLACE FUNCTION get_conversations_simple()
RETURNS TABLE (
    id UUID,
    user_id BIGINT,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 
    id,
    user_id,
    status,
    created_at
  FROM conversations
  ORDER BY created_at DESC;
$$;

-- Функция для проверки таблиц
CREATE OR REPLACE FUNCTION check_tables()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 'users'::TEXT, COUNT(*) FROM users
  UNION ALL
  SELECT 'conversations'::TEXT, COUNT(*) FROM conversations
  UNION ALL
  SELECT 'messages'::TEXT, COUNT(*) FROM messages;
$$;

-- Права на выполнение
GRANT EXECUTE ON FUNCTION test_connection() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_simple() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_tables() TO anon, authenticated;

-- Только админ (замените 708907063 на ваш Telegram ID)
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES (708907063, 'admin', 'Администратор', TRUE)
ON CONFLICT (telegram_id) DO UPDATE SET is_admin = TRUE;

-- Удаляем тестовые данные если они есть
DELETE FROM messages WHERE sender_id = 123456789;
DELETE FROM conversations WHERE user_id = 123456789;
DELETE FROM users WHERE telegram_id = 123456789;
