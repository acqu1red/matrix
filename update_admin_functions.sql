-- Обновление функций для улучшенной админ панели
-- Выполните в Supabase SQL Editor

SET search_path TO public;

-- Обновленная функция для получения диалогов администратором
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
        COALESCE(u.username, u.first_name, CONCAT('Пользователь #', u.telegram_id)) as username,
        u.first_name,
        u.last_name,
        c.status,
        COALESCE(c.last_message_at, c.created_at) as last_message_at,
        c.created_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        COALESCE(
            (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
            'Нет сообщений'
        ) as last_message
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
END;
$$;

-- Обновленная функция для получения сообщений с информацией о пользователях
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
        COALESCE(u.username, u.first_name, CONCAT('Пользователь #', u.telegram_id)) as sender_username,
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

-- Функция для получения статистики диалогов
CREATE OR REPLACE FUNCTION get_conversations_stats()
RETURNS TABLE (
    total_conversations BIGINT,
    open_conversations BIGINT,
    in_progress_conversations BIGINT,
    closed_conversations BIGINT,
    total_messages BIGINT
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_conversations,
        COUNT(*) FILTER (WHERE status = 'open') as open_conversations,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_conversations,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_conversations,
        (SELECT COUNT(*) FROM messages) as total_messages
    FROM conversations;
END;
$$;

-- Предоставляем права на выполнение функций
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_stats() TO anon, authenticated;

-- Проверяем обновление
SELECT 'Functions updated successfully!' as status;
