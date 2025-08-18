-- Отключение RLS для всех таблиц (для анонимного доступа через API ключи)
ALTER TABLE public.bot_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roulette_history DISABLE ROW LEVEL SECURITY;

-- Проверка статуса RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bot_user', 'promocodes', 'roulette_history');
