-- Обновление функции get_admin_conversations для правильной работы фильтров
-- Выполните этот скрипт в Supabase SQL Editor

-- Функция для получения диалогов администратором с информацией о последнем сообщении
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
    last_message TEXT,
    last_message_sender_is_admin BOOLEAN
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
        ) as last_message,
        COALESCE(
            (SELECT u2.is_admin FROM messages m2 
             JOIN users u2 ON m2.sender_id = u2.telegram_id 
             WHERE m2.conversation_id = c.id 
             ORDER BY m2.created_at DESC LIMIT 1),
            FALSE
        ) as last_message_sender_is_admin
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
END;
$$;

-- Предоставляем права на выполнение функции
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon, authenticated;

-- Проверяем обновление
SELECT 'Функция get_admin_conversations обновлена!' as status;
