-- =====================================================
-- ПРИНУДИТЕЛЬНОЕ УДАЛЕНИЕ ФУНКЦИИ get_conversation_messages
-- =====================================================

-- Показываем все версии функции get_conversation_messages
SELECT 'Существующие версии функции get_conversation_messages:' as info;
SELECT 
    proname,
    oid::regprocedure as full_name,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_conversation_messages' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

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
        RAISE NOTICE 'Удаляем функцию: %', func_record.full_name;
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.full_name || ' CASCADE';
    END LOOP;
END $$;

-- Проверяем, что функция удалена
SELECT 'Проверка удаления функции get_conversation_messages:' as info;
SELECT 
    proname,
    oid::regprocedure as full_name
FROM pg_proc 
WHERE proname = 'get_conversation_messages' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Если функция все еще существует, показываем ошибку
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_conversation_messages' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE EXCEPTION 'Функция get_conversation_messages все еще существует!';
    ELSE
        RAISE NOTICE 'Функция get_conversation_messages успешно удалена!';
    END IF;
END $$;
