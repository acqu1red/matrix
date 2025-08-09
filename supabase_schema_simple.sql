-- Упрощённая SQL схема для Supabase без RLS
-- Выполните этот код в SQL Editor в Supabase

-- 1. Удаляем старые таблицы если они есть (будьте осторожны!)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS dialogs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Таблица пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица диалогов (поддержка)
CREATE TABLE dialogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    admin_id BIGINT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    subject VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Таблица сообщений
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialog_id UUID NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
    file_url TEXT,
    file_name VARCHAR(255),
    is_from_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Индексы для оптимизации
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_dialogs_user_id ON dialogs(user_id);
CREATE INDEX idx_dialogs_admin_id ON dialogs(admin_id);
CREATE INDEX idx_dialogs_status ON dialogs(status);
CREATE INDEX idx_messages_dialog_id ON messages(dialog_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 6. Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dialogs_updated_at BEFORE UPDATE ON dialogs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ОТКЛЮЧАЕМ RLS (Row Level Security) для всех таблиц
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE dialogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 8. Создание администраторов
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES 
    (708907063, 'acqu1red', 'Administrator', TRUE),
    (7365307696, 'cas3method', 'Administrator', TRUE);

-- 9. Разрешения для anon роли (публичный доступ)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON dialogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon;

-- 10. Разрешения на использование последовательностей
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO anon;

-- Готово! Теперь таблицы доступны для всех операций без ограничений RLS
