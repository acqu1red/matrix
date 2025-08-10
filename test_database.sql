-- Тестирование базы данных
-- Выполните этот файл для проверки работы

-- 1. Проверяем существование таблиц
SELECT 
    'Таблицы:' as info,
    table_name,
    'существует' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'conversations', 'messages', 'admins', 'payments');

-- 2. Проверяем администраторов
SELECT 
    'Администраторы:' as info,
    u.telegram_id,
    u.username,
    u.is_admin,
    a.role
FROM users u
LEFT JOIN admins a ON u.telegram_id = a.telegram_id
WHERE u.telegram_id IN (708907063, 7365307696);

-- 3. Проверяем политики безопасности
SELECT 
    'Политики:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'conversations', 'messages', 'admins', 'payments');

-- 4. Проверяем функцию
SELECT 
    'Функция:' as info,
    proname as function_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_conversations') 
         THEN 'существует' ELSE 'не существует' END as status
FROM pg_proc 
WHERE proname = 'get_admin_conversations';

-- 5. Тестируем функцию (если она существует)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_conversations') THEN
        RAISE NOTICE 'Функция get_admin_conversations существует';
        
        -- Пробуем вызвать функцию
        PERFORM * FROM get_admin_conversations() LIMIT 1;
        RAISE NOTICE 'Функция работает корректно';
    ELSE
        RAISE NOTICE 'Функция get_admin_conversations не существует';
    END IF;
END $$;

-- 6. Проверяем права доступа
SELECT 
    'Права:' as info,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'conversations', 'messages', 'admins', 'payments');
