-- Исправление прав доступа к таблице subscriptions

-- Отключаем RLS временно для отладки
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Или создаем политику для анонимного доступа (для тестирования)
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Политика для полного доступа (только для тестирования)
-- DROP POLICY IF EXISTS "Allow all access" ON subscriptions;
-- CREATE POLICY "Allow all access" ON subscriptions
--     FOR ALL USING (true);

-- Проверяем существование таблицы
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
);

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public';

-- Проверяем права доступа
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public';
