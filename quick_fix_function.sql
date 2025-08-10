-- =====================================================
-- БЫСТРОЕ ИСПРАВЛЕНИЕ ФУНКЦИИ get_conversation_messages
-- =====================================================

-- Удаляем старую функцию
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER);
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT);

-- Создаем правильную функцию с BIGINT для всех полей
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    sender_id BIGINT,
    sender_is_admin BOOLEAN,
    message_type VARCHAR,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.sender_id,
        a.telegram_id IS NOT NULL as sender_is_admin,
        m.message_type,
        m.is_read,
        m.created_at
    FROM messages m
    LEFT JOIN admins a ON m.sender_id = a.telegram_id
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Назначаем права
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO service_role;

-- Проверяем результат
SELECT 'Функция исправлена!' as status;
