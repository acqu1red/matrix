-- Исправление RLS политик для таблицы bot_user
-- Отключаем RLS для bot_user, так как доступ контролируется через API ключи
ALTER TABLE public.bot_user DISABLE ROW LEVEL SECURITY;

-- Или создаем политики, если RLS должен быть включен
-- ALTER TABLE public.bot_user ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Enable all operations for bot_user" ON public.bot_user;
-- CREATE POLICY "Enable all operations for bot_user" ON public.bot_user
-- FOR ALL USING (true) WITH CHECK (true);

-- Исправление RLS политик для таблицы promocodes
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can view their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can insert their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can update their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can delete their own promocodes" ON public.promocodes;

-- Создаем новые политики для promocodes
CREATE POLICY "Users can view their own promocodes" ON public.promocodes
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own promocodes" ON public.promocodes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own promocodes" ON public.promocodes
FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own promocodes" ON public.promocodes
FOR DELETE USING (true);

-- Исправление RLS политик для таблицы roulette_history
ALTER TABLE public.roulette_history ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can view their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can insert their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can update their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can delete their own roulette history" ON public.roulette_history;

-- Создаем новые политики для roulette_history
CREATE POLICY "Users can view their own roulette history" ON public.roulette_history
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own roulette history" ON public.roulette_history
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own roulette history" ON public.roulette_history
FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own roulette history" ON public.roulette_history
FOR DELETE USING (true);

-- Альтернативный вариант: отключить RLS для всех таблиц (если используется анонимный доступ)
-- ALTER TABLE public.bot_user DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.promocodes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.roulette_history DISABLE ROW LEVEL SECURITY;

-- Проверка существующих политик
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('bot_user', 'promocodes', 'roulette_history', 'quest_history');
