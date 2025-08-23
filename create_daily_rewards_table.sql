-- Создание таблицы для ежедневных наград
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

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_daily_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_rewards_updated_at
    BEFORE UPDATE ON daily_rewards
    FOR EACH ROW
    EXECUTE PROCEDURE update_daily_rewards_updated_at();

-- Добавляем политики RLS (Row Level Security)
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

-- Политика для полного доступа для анонимных пользователей (как в других таблицах)
CREATE POLICY "Enable all access for daily_rewards" ON daily_rewards
    FOR ALL USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON daily_rewards TO anon;
GRANT ALL ON daily_rewards TO authenticated;
