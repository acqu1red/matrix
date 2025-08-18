-- Безопасная настройка RLS для анонимного доступа
-- Это уберет предупреждение "Unrestricted data is publicly accessible"

-- Включаем RLS для всех таблиц
ALTER TABLE public.bot_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roulette_history ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Enable all operations for bot_user" ON public.bot_user;
DROP POLICY IF EXISTS "Users can view their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can insert their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can update their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can delete their own promocodes" ON public.promocodes;
DROP POLICY IF EXISTS "Users can view their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can insert their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can update their own roulette history" ON public.roulette_history;
DROP POLICY IF EXISTS "Users can delete their own roulette history" ON public.roulette_history;

-- Создаем политики для bot_user (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Enable all operations for bot_user" ON public.bot_user
FOR ALL USING (true) WITH CHECK (true);

-- Создаем политики для promocodes (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Enable all operations for promocodes" ON public.promocodes
FOR ALL USING (true) WITH CHECK (true);

-- Создаем политики для roulette_history (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Enable all operations for roulette_history" ON public.roulette_history
FOR ALL USING (true) WITH CHECK (true);

-- Удаление существующей таблицы quest_history (если есть)
DROP TABLE IF EXISTS public.quest_history CASCADE;

-- Создание новой таблицы quest_history с RLS
CREATE TABLE public.quest_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id bigint NULL,
  quest_id text NOT NULL,
  quest_name text NOT NULL,
  difficulty text NOT NULL,
  mulacoin_earned integer NULL DEFAULT 0,
  experience_earned integer NULL DEFAULT 0,
  completed_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT quest_history_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON public.quest_history USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_quest_history_quest_id ON public.quest_history USING btree (quest_id) TABLESPACE pg_default;

-- Добавление проверки для поля difficulty
ALTER TABLE public.quest_history ADD CONSTRAINT quest_history_difficulty_check 
CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]));

-- Включаем RLS для quest_history
ALTER TABLE public.quest_history ENABLE ROW LEVEL SECURITY;

-- Создаем политики для quest_history (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Enable all operations for quest_history" ON public.quest_history
FOR ALL USING (true) WITH CHECK (true);

-- Проверка статуса RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Enabled'
        ELSE 'RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bot_user', 'promocodes', 'roulette_history', 'quest_history');

-- Проверка политик
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('bot_user', 'promocodes', 'roulette_history', 'quest_history');

-- Проверка создания таблицы quest_history
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quest_history'
ORDER BY ordinal_position;
