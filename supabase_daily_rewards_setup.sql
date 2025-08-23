-- Выполните этот SQL в Supabase SQL Editor для настройки таблицы daily_rewards

-- 1. Создание таблицы для ежедневных наград
CREATE TABLE IF NOT EXISTS daily_rewards (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_day INTEGER DEFAULT 1,
    last_claimed TIMESTAMP WITH TIME ZONE,
    streak_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);

-- 3. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_daily_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_daily_rewards_updated_at ON daily_rewards;
CREATE TRIGGER update_daily_rewards_updated_at
    BEFORE UPDATE ON daily_rewards
    FOR EACH ROW
    EXECUTE PROCEDURE update_daily_rewards_updated_at();

-- 5. Включение RLS (Row Level Security)
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

-- 6. Удаляем старые политики если есть
DROP POLICY IF EXISTS "Enable all access for daily_rewards" ON daily_rewards;
DROP POLICY IF EXISTS "Users can view own daily rewards" ON daily_rewards;
DROP POLICY IF EXISTS "Users can update own daily rewards" ON daily_rewards;
DROP POLICY IF EXISTS "Users can insert own daily rewards" ON daily_rewards;

-- 7. Создаем универсальную политику доступа
CREATE POLICY "Enable all access for daily_rewards" ON daily_rewards
    FOR ALL USING (true)
    WITH CHECK (true);

-- 8. Даем права доступа
GRANT ALL ON daily_rewards TO anon;
GRANT ALL ON daily_rewards TO authenticated;

-- 9. Даем права на последовательность (только если она существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'daily_rewards_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE daily_rewards_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE daily_rewards_id_seq TO authenticated;
    END IF;
END $$;
