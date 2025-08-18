-- Удаление существующей таблицы quest_history (если существует)
DROP TABLE IF EXISTS public.quest_history CASCADE;

-- Удаление связанных объектов
DROP INDEX IF EXISTS idx_quest_history_user_id;
DROP INDEX IF EXISTS idx_quest_history_quest_id;

-- Создание новой таблицы quest_history
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

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON public.quest_history USING btree (user_id) TABLESPACE pg_default;

-- Создание индекса для поиска по quest_id
CREATE INDEX IF NOT EXISTS idx_quest_history_quest_id ON public.quest_history USING btree (quest_id) TABLESPACE pg_default;

-- Добавление проверки для поля difficulty
ALTER TABLE public.quest_history ADD CONSTRAINT quest_history_difficulty_check 
CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]));

-- Включение Row Level Security (RLS)
ALTER TABLE public.quest_history ENABLE ROW LEVEL SECURITY;

-- Создание политики для чтения (пользователи могут читать только свои записи)
CREATE POLICY "Users can view their own quest history" ON public.quest_history
FOR SELECT USING (auth.uid()::bigint = user_id);

-- Создание политики для вставки (пользователи могут создавать записи со своим user_id)
CREATE POLICY "Users can insert their own quest history" ON public.quest_history
FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

-- Создание политики для обновления (пользователи могут обновлять только свои записи)
CREATE POLICY "Users can update their own quest history" ON public.quest_history
FOR UPDATE USING (auth.uid()::bigint = user_id);

-- Создание политики для удаления (пользователи могут удалять только свои записи)
CREATE POLICY "Users can delete their own quest history" ON public.quest_history
FOR DELETE USING (auth.uid()::bigint = user_id);

-- Комментарии к таблице и полям
COMMENT ON TABLE public.quest_history IS 'История прохождения квестов пользователями';
COMMENT ON COLUMN public.quest_history.user_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN public.quest_history.quest_id IS 'Уникальный идентификатор квеста';
COMMENT ON COLUMN public.quest_history.quest_name IS 'Название квеста';
COMMENT ON COLUMN public.quest_history.difficulty IS 'Сложность квеста (easy, medium, hard)';
COMMENT ON COLUMN public.quest_history.mulacoin_earned IS 'Количество заработанных mulacoin';
COMMENT ON COLUMN public.quest_history.experience_earned IS 'Количество заработанного опыта';
COMMENT ON COLUMN public.quest_history.completed_at IS 'Время завершения квеста';

-- Проверка создания таблицы
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
