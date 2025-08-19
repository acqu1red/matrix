-- Диагностика и исправление проблем с доступом к квестам
-- Выполняйте запросы по одному

-- 1. Проверяем структуру таблицы admins
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- 2. Проверяем данные в таблице admins
SELECT * FROM admins;

-- 3. Проверяем структуру таблицы subscriptions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- 4. Проверяем данные в таблице subscriptions
SELECT * FROM subscriptions;

-- 5. Проверяем RLS политики для таблицы admins
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admins';

-- 6. Проверяем RLS политики для таблицы subscriptions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- 7. Отключаем RLS для таблицы admins (если есть проблемы с доступом)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 8. Отключаем RLS для таблицы subscriptions (если есть проблемы с доступом)
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- 9. Создаем политики для анонимного доступа к таблице admins
DROP POLICY IF EXISTS "Enable read access for all users" ON admins;
CREATE POLICY "Enable read access for all users" ON admins FOR ALL USING (true) WITH CHECK (true);

-- 10. Создаем политики для анонимного доступа к таблице subscriptions
DROP POLICY IF EXISTS "Enable read access for all users" ON subscriptions;
CREATE POLICY "Enable read access for all users" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- 11. Включаем RLS обратно
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 12. Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('admins', 'subscriptions');

-- 13. Тестовые запросы для проверки доступа
SELECT COUNT(*) as admins_count FROM admins;
SELECT COUNT(*) as subscriptions_count FROM subscriptions;

-- 14. Проверяем конкретных админов
SELECT * FROM admins WHERE telegram_id IN ('708907063', '7365307696');
SELECT * FROM admins WHERE user_id IN ('708907063', '7365307696');

-- 15. Проверяем подписки
SELECT * FROM subscriptions WHERE telegram_id IN ('708907063', '7365307696');
SELECT * FROM subscriptions WHERE user_id IN ('708907063', '7365307696');
