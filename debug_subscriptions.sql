-- Диагностика таблицы subscriptions
-- Выполните эти запросы в Supabase SQL Editor ПО ОЧЕРЕДИ

-- 1. Сначала проверим структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Посмотрим все записи в таблице (первые 5)
SELECT * FROM subscriptions LIMIT 5;

-- 3. Проверим количество записей
SELECT COUNT(*) as total_subscriptions FROM subscriptions;

-- 4. Проверим RLS политики
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

-- 5. Проверяем статус RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'subscriptions';
