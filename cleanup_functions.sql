-- =====================================================
-- ОЧИСТКА СУЩЕСТВУЮЩИХ ФУНКЦИЙ
-- =====================================================

-- Удаляем все существующие функции, которые могут конфликтовать
DROP FUNCTION IF EXISTS is_admin(BIGINT);
DROP FUNCTION IF EXISTS get_admin_conversations();
DROP FUNCTION IF EXISTS get_admin_conversations() CASCADE;
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER);
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT);
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_conversations_stats();
DROP FUNCTION IF EXISTS get_conversations_stats() CASCADE;
DROP FUNCTION IF EXISTS test_connection();
DROP FUNCTION IF EXISTS test_connection() CASCADE;
DROP FUNCTION IF EXISTS check_tables();
DROP FUNCTION IF EXISTS check_tables() CASCADE;
DROP FUNCTION IF EXISTS get_conversations_simple();
DROP FUNCTION IF EXISTS get_conversations_simple() CASCADE;

-- Удаляем функции с другими сигнатурами (если есть)
DROP FUNCTION IF EXISTS is_admin(INTEGER);
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT);
DROP FUNCTION IF EXISTS get_conversation_messages(NUMERIC);

-- Принудительно удаляем все функции с любой сигнатурой
DO $$
DECLARE
    func_record RECORD;
    func_names TEXT[] := ARRAY['is_admin', 'get_admin_conversations', 'get_conversation_messages', 'get_conversations_stats', 'test_connection', 'check_tables', 'get_conversations_simple'];
    func_name TEXT;
BEGIN
    FOREACH func_name IN ARRAY func_names
    LOOP
        FOR func_record IN 
            SELECT proname, oid::regprocedure as full_name
            FROM pg_proc 
            WHERE proname = func_name
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        LOOP
            EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.full_name || ' CASCADE';
        END LOOP;
    END LOOP;
END $$;

-- Проверяем, что функции удалены
SELECT 'Функции очищены успешно' as status;

-- Показываем оставшиеся функции (если есть)
SELECT 
    routine_name,
    routine_type,
    data_type
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
    );
