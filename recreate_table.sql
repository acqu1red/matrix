-- Полное пересоздание таблицы users

-- Удаляем старую таблицу если она существует
DROP TABLE IF EXISTS users CASCADE;

-- Создаем новую таблицу с правильной структурой
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице
COMMENT ON TABLE users IS 'Таблица для связи Telegram ID пользователей с их email адресами';
COMMENT ON COLUMN users.telegram_id IS 'Telegram ID пользователя (уникальный)';
COMMENT ON COLUMN users.email IS 'Email адрес пользователя для связи с платежами';

-- Проверяем результат
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
