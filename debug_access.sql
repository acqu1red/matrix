-- Диагностика проблем с доступом к квестам
-- Выполняйте запросы по одному

-- 1. Проверяем структуру таблицы admins
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- 2. Проверяем данные в таблице admins
SELECT * FROM admins LIMIT 10;

-- 3. Проверяем структуру таблицы subscriptions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- 4. Проверяем данные в таблице subscriptions
SELECT * FROM subscriptions LIMIT 10;

-- 5. Проверяем RLS политики для таблицы admins
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admins';

-- 6. Проверяем RLS политики для таблицы subscriptions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- 7. Проверяем статус RLS для обеих таблиц
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('admins', 'subscriptions');

-- 8. Тестовый запрос для проверки доступа к таблице admins
SELECT COUNT(*) as admins_count FROM admins;

-- 9. Тестовый запрос для проверки доступа к таблице subscriptions
SELECT COUNT(*) as subscriptions_count FROM subscriptions;
