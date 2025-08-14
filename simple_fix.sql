-- Простое исправление: добавление колонки email в таблицу users

-- Добавляем колонку email если её нет
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Добавляем колонку created_at если её нет
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Добавляем колонку updated_at если её нет
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Создаем индексы если их нет
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Проверяем результат
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
