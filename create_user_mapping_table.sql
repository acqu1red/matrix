-- Создание таблицы для привязки email к Telegram ID
CREATE TABLE IF NOT EXISTS user_email_mapping (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    telegram_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_user_email_mapping_email ON user_email_mapping(email);
CREATE INDEX IF NOT EXISTS idx_user_email_mapping_telegram_id ON user_email_mapping(telegram_id);

-- Создание RLS политик
ALTER TABLE user_email_mapping ENABLE ROW LEVEL SECURITY;

-- Политика для всех операций (только для сервисного роля)
CREATE POLICY "Service role can manage user mapping" ON user_email_mapping
    FOR ALL USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_user_email_mapping_updated_at 
    BEFORE UPDATE ON user_email_mapping 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_mapping_updated_at();
