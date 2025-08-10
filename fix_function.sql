-- Исправление функции get_admin_conversations
-- Удаляем старую функцию и создаем новую

-- Удаляем старую функцию (если существует)
DROP FUNCTION IF EXISTS get_admin_conversations();

-- Создаем функцию для получения диалогов администратора
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    user_id BIGINT,
    username VARCHAR,
    last_message TEXT,
    message_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.telegram_id as user_id,
        COALESCE(u.username, CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))) as username,
        m.content as last_message,
        COUNT(*) OVER (PARTITION BY c.user_id) as message_count,
        c.last_message_at
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    )
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Даем права на выполнение функции всем пользователям
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO service_role;

-- Проверяем, что функция создана
SELECT 
    proname as function_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_admin_conversations';
