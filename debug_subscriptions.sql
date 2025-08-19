-- Диагностика таблицы subscriptions
-- Выполните эти запросы в Supabase SQL Editor

-- 1. Проверяем структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Проверяем все записи в таблице
SELECT * FROM subscriptions LIMIT 10;

-- 3. Проверяем количество записей
SELECT COUNT(*) as total_subscriptions FROM subscriptions;

-- 4. Проверяем уникальные значения в поле tg_id (если есть)
SELECT DISTINCT tg_id FROM subscriptions WHERE tg_id IS NOT NULL LIMIT 10;

-- 5. Проверяем записи с конкретным tg_id (замените на реальный ID)
-- SELECT * FROM subscriptions WHERE tg_id = '708907063';

-- 6. Проверяем RLS политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- 7. Проверяем статус RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'subscriptions';
