-- Простая настройка таблицы daily_rewards для Supabase
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Создание таблицы
CREATE TABLE IF NOT EXISTS daily_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    current_day INTEGER DEFAULT 1,
    last_claimed TIMESTAMPTZ,
    streak_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Создание индекса
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);

-- 3. Включение RLS
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

-- 4. Удаление старых политик
DROP POLICY IF EXISTS "Enable all access for daily_rewards" ON daily_rewards;

-- 5. Создание политики полного доступа
CREATE POLICY "Enable all access for daily_rewards" ON daily_rewards
    FOR ALL USING (true)
    WITH CHECK (true);

-- 6. Права доступа
GRANT ALL ON TABLE daily_rewards TO anon;
GRANT ALL ON TABLE daily_rewards TO authenticated;
GRANT ALL ON TABLE daily_rewards TO service_role;
