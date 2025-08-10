-- =====================================================
-- ИСПРАВЛЕНИЕ КОНФЛИКТА ТИПОВ В ФУНКЦИИ get_conversation_messages
-- =====================================================

-- Удаляем все существующие версии функции get_conversation_messages
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER);
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT);
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_conversation_messages(NUMERIC);
DROP FUNCTION IF EXISTS get_conversation_messages(NUMERIC) CASCADE;

-- Принудительно удаляем все версии функции
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oid::regprocedure as full_name
        FROM pg_proc 
        WHERE proname = 'get_conversation_messages' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.full_name || ' CASCADE';
    END LOOP;
END $$;

-- Создаем правильную версию функции с BIGINT (как в database_schema.sql)
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id BIGINT)
RETURNS TABLE (
    id INTEGER,
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
    LEFT JOIN admins a ON m.sender_id = a.telegram_id AND a.is_active = true
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Назначаем права на функцию
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(BIGINT) TO service_role;

-- Проверяем, что функция создана правильно
SELECT 'Проверка функции get_conversation_messages:' as info;

SELECT 
    proname,
    oid::regprocedure as full_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_conversation_messages' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Тестируем функцию (если есть данные)
SELECT 'Тестирование функции:' as test_info;

-- Проверяем, есть ли диалоги для тестирования
SELECT 
    'Доступные диалоги для тестирования:' as info,
    COUNT(*) as total_conversations
FROM conversations;

-- Если есть диалоги, тестируем функцию
DO $$
DECLARE
    test_conv_id BIGINT;
    test_result RECORD;
BEGIN
    -- Получаем первый диалог для тестирования
    SELECT id INTO test_conv_id FROM conversations LIMIT 1;
    
    IF test_conv_id IS NOT NULL THEN
        RAISE NOTICE 'Тестируем функцию с conversation_id: %', test_conv_id;
        
        -- Тестируем функцию
        FOR test_result IN 
            SELECT * FROM get_conversation_messages(test_conv_id)
        LOOP
            RAISE NOTICE 'Сообщение: ID=%, Content=%, Sender=%, IsAdmin=%', 
                test_result.id, 
                LEFT(test_result.content, 50), 
                test_result.sender_id, 
                test_result.sender_is_admin;
        END LOOP;
        
        RAISE NOTICE 'Функция работает корректно!';
    ELSE
        RAISE NOTICE 'Нет диалогов для тестирования функции';
    END IF;
END $$;

SELECT 'Исправление завершено!' as status;
