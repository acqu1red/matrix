-- SQL для создания схемы в Supabase
-- Выполните этот код в SQL Editor в вашем проекте Supabase

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

-- Политики доступа (базовые - можно настроить позже)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all messages" ON messages FOR SELECT USING (true);

-- Политики для вставки
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON messages FOR INSERT WITH CHECK (true);

-- Политики для обновления
CREATE POLICY "Enable update for authenticated users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users" ON conversations FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users" ON messages FOR UPDATE USING (true);

-- Вставка тестового админа (замените telegram_id на ваш)
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES (123456789, 'admin_username', 'Администратор', TRUE)
ON CONFLICT (telegram_id) DO UPDATE SET is_admin = TRUE;

-- Представления для удобного доступа к данным
CREATE OR REPLACE VIEW admin_conversations_view AS
SELECT 
    c.id,
    c.user_id,
    u.username,
    u.first_name,
    u.last_name,
    c.status,
    c.last_message_at,
    c.created_at,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
    (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations c
JOIN users u ON c.user_id = u.telegram_id
ORDER BY c.last_message_at DESC;

-- Представление для сообщений с информацией о пользователях
CREATE OR REPLACE VIEW messages_with_users_view AS
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
ORDER BY m.created_at ASC;
