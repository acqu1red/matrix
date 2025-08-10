-- Полный код для создания всех таблиц с нуля
-- Выполните в Supabase SQL Editor

SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS "pgcrypt";

-- Таблица пользователей
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

-- Таблица диалогов/чатов
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(telegram_id),
    admin_id BIGINT REFERENCES users(telegram_id),
    status VARCHAR(50) DEFAULT 'open', -- open, closed, pending
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(telegram_id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, file, image
    file_url TEXT,
    file_name TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления last_message_at в conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для обновления времени последнего сообщения
CREATE TRIGGER update_last_message_trigger AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- RLS (Row Level Security) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политики для users - любой может читать, создавать и обновлять
CREATE POLICY "users_select_policy" ON users
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE TO anon, authenticated USING (true);

-- Политики для conversations - любой может читать, создавать и обновлять
CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE TO anon, authenticated USING (true);

-- Политики для messages - любой может читать, создавать и обновлять
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE TO anon, authenticated USING (true);

-- Права на таблицы
GRANT SELECT, INSERT, UPDATE ON users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;

-- Права на sequence (если используется BIGSERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Функция для получения диалогов администратором
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    id UUID,
    user_id BIGINT,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    status VARCHAR(50),
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT,
    last_message TEXT,
    last_message_sender_is_admin BOOLEAN
) 
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        COALESCE(u.username, u.first_name, CONCAT('Пользователь #', u.telegram_id)) as username,
        u.first_name,
        u.last_name,
        c.status,
        COALESCE(c.last_message_at, c.created_at) as last_message_at,
        c.created_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        COALESCE(
            (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
            'Нет сообщений'
        ) as last_message,
        COALESCE(
            (SELECT u2.is_admin FROM messages m2 
             JOIN users u2 ON m2.sender_id = u2.telegram_id 
             WHERE m2.conversation_id = c.id 
             ORDER BY m2.created_at DESC LIMIT 1),
            FALSE
        ) as last_message_sender_is_admin
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
END;
$$;

-- Функция для получения сообщений с информацией о пользователях
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id BIGINT,
    sender_username VARCHAR(255),
    sender_first_name VARCHAR(255),
    sender_is_admin BOOLEAN,
    content TEXT,
    message_type VARCHAR(50),
    file_url TEXT,
    file_name TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        u.username as sender_username,
        u.first_name as sender_first_name,
        u.is_admin as sender_is_admin,
        m.content,
        m.message_type,
        m.file_url,
        m.file_name,
        m.is_read,
        m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.telegram_id
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$;

-- Функция для проверки прав администратора
CREATE OR REPLACE FUNCTION is_admin(user_telegram_id BIGINT)
RETURNS BOOLEAN
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    admin_status BOOLEAN := FALSE;
BEGIN
    SELECT is_admin INTO admin_status
    FROM users 
    WHERE telegram_id = user_telegram_id;
    
    RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Предоставляем права на выполнение функций для анонимного пользователя
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO anon, authenticated;

-- Вставка администратора (замените 708907063 на ваш Telegram ID)
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES (708907063, 'admin', 'Администратор', TRUE)
ON CONFLICT (telegram_id) DO UPDATE SET is_admin = TRUE;

-- Проверяем создание таблиц
SELECT 'Tables created successfully!' as status;
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages;
