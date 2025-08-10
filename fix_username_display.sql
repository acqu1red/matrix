-- Исправление отображения имен пользователей в админ панели
-- Выполните в Supabase SQL Editor

SET search_path TO public;

-- Улучшенная функция для получения диалогов администратором
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    id UUID,
    user_id BIGINT,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    status VARCHAR(50),
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT,
    last_message TEXT
) 
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        CASE 
            WHEN u.username IS NOT NULL AND u.username != '' THEN u.username
            WHEN u.first_name IS NOT NULL AND u.first_name != '' THEN u.first_name
            ELSE CONCAT('Пользователь #', u.telegram_id)::VARCHAR(255)
        END as username,
        u.first_name,
        u.last_name,
        c.status,
        COALESCE(c.last_message_at, c.created_at) as last_message_at,
        c.created_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        CASE 
            WHEN (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) > 0 
            THEN (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1)
            ELSE 'Нет сообщений'
        END as last_message
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
END;
$$;

-- Улучшенная функция для получения сообщений с информацией о пользователях
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id BIGINT,
    sender_username VARCHAR(255),
    sender_first_name VARCHAR(255),
    sender_is_admin BOOLEAN,
    content TEXT,
    message_type VARCHAR(50),
    file_url TEXT,
    file_name TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        CASE 
            WHEN u.username IS NOT NULL AND u.username != '' THEN u.username
            WHEN u.first_name IS NOT NULL AND u.first_name != '' THEN u.first_name
            ELSE CONCAT('Пользователь #', u.telegram_id)::VARCHAR(255)
        END as sender_username,
        u.first_name as sender_first_name,
        u.is_admin as sender_is_admin,
        m.content,
        m.message_type,
        m.file_url,
        m.file_name,
        m.is_read,
        m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.telegram_id
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$;

-- Предоставляем права на выполнение функций
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(UUID) TO anon, authenticated;

-- Проверяем обновление
SELECT 'Functions updated successfully!' as status;

-- Тестовая функция для проверки данных пользователей
CREATE OR REPLACE FUNCTION test_user_display()
RETURNS TABLE (
    telegram_id BIGINT,
    username VARCHAR(255),
    first_name VARCHAR(255),
    display_name VARCHAR(255)
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.telegram_id,
        u.username,
        u.first_name,
        CASE 
            WHEN u.username IS NOT NULL AND u.username != '' THEN u.username
            WHEN u.first_name IS NOT NULL AND u.first_name != '' THEN u.first_name
            ELSE CONCAT('Пользователь #', u.telegram_id)::VARCHAR(255)
        END as display_name
    FROM users u
    ORDER BY u.created_at DESC
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION test_user_display() TO anon, authenticated;
