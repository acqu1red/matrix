-- Простое исправление: отключение RLS для всех таблиц
-- Это позволит анонимному доступу через API ключи

-- Отключение RLS для всех таблиц
ALTER TABLE public.bot_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roulette_history DISABLE ROW LEVEL SECURITY;

-- Удаление существующей таблицы quest_history (если есть)
DROP TABLE IF EXISTS public.quest_history CASCADE;

-- Создание новой таблицы quest_history без RLS
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

-- НЕ включаем RLS для quest_history
-- ALTER TABLE public.quest_history ENABLE ROW LEVEL SECURITY;

-- Проверка статуса RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
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
