-- Создание отдельной таблицы bot_users для Telegram бота
-- (не путать с auth.users - стандартной таблицей Supabase)

-- Создаем таблицу bot_users
CREATE TABLE IF NOT EXISTS bot_users (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_bot_users_email ON bot_users(email);
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram_id ON bot_users(telegram_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_bot_users_updated_at ON bot_users;
CREATE TRIGGER update_bot_users_updated_at 
    BEFORE UPDATE ON bot_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице
COMMENT ON TABLE bot_users IS 'Таблица для связи Telegram ID пользователей с их email адресами (для бота)';
COMMENT ON COLUMN bot_users.telegram_id IS 'Telegram ID пользователя (уникальный)';
COMMENT ON COLUMN bot_users.email IS 'Email адрес пользователя для связи с платежами';

-- Проверяем результат
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bot_users' 
ORDER BY ordinal_position;
