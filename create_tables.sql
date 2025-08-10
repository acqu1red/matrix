-- Полный SQL скрипт для создания системы поддержки
-- Удалите все существующие таблицы и создайте заново

-- 1. Создание таблиц

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица диалогов
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    admin_id BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'answered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- 3. Создание функций

-- Функция для проверки прав администратора
CREATE OR REPLACE FUNCTION is_admin(user_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = user_telegram_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения диалогов для админа
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    id INTEGER,
    user_id BIGINT,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT,
    last_message TEXT,
    last_message_sender_is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        COALESCE(u.username, CONCAT('user_', u.telegram_id)) as username,
        u.first_name,
        u.last_name,
        c.status,
        c.created_at,
        COALESCE(last_msg.created_at, c.created_at) as last_message_at,
        COALESCE(msg_count.count, 0) as message_count,
        COALESCE(last_msg.content, 'Нет сообщений') as last_message,
        COALESCE(last_msg.is_admin, FALSE) as last_message_sender_is_admin
    FROM conversations c
    LEFT JOIN users u ON c.user_id = u.telegram_id
    LEFT JOIN (
        SELECT 
            conversation_id,
            created_at,
            content,
            sender_id IN (SELECT user_id FROM admins) as is_admin
        FROM messages m1
        WHERE created_at = (
            SELECT MAX(created_at) 
            FROM messages m2 
            WHERE m2.conversation_id = m1.conversation_id
        )
    ) last_msg ON c.id = last_msg.conversation_id
    LEFT JOIN (
        SELECT 
            conversation_id,
            COUNT(*) as count
        FROM messages
        GROUP BY conversation_id
    ) msg_count ON c.id = msg_count.conversation_id
    ORDER BY last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения сообщений диалога
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    content TEXT,
    sender_id BIGINT,
    sender_is_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.sender_id,
        m.sender_id IN (SELECT user_id FROM admins) as sender_is_admin,
        m.created_at
    FROM messages m
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения статистики
CREATE OR REPLACE FUNCTION get_conversations_stats()
RETURNS TABLE (
    total_conversations BIGINT,
    open_conversations BIGINT,
    total_messages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT CASE WHEN c.status = 'open' THEN c.id END) as open_conversations,
        COUNT(m.id) as total_messages
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Включение RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. Создание политик безопасности

-- Политики для таблицы users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (telegram_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (telegram_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (telegram_id = current_setting('app.current_user_id', true)::BIGINT);

-- Политики для таблицы conversations
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::BIGINT);

-- Политики для таблицы messages
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = current_setting('app.current_user_id', true)::BIGINT
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = current_setting('app.current_user_id', true)::BIGINT
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = current_setting('app.current_user_id', true)::BIGINT);

-- Политики для таблицы admins
CREATE POLICY "Admins can view admin list" ON admins
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::BIGINT
    );

-- 6. Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Вставка тестового администратора (замените на ваш Telegram ID)
-- INSERT INTO users (telegram_id, username, first_name, last_name) 
-- VALUES (YOUR_TELEGRAM_ID, 'your_username', 'Your', 'Name')
-- ON CONFLICT (telegram_id) DO NOTHING;

-- INSERT INTO admins (user_id, role) 
-- VALUES (YOUR_TELEGRAM_ID, 'admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- 8. Создание представлений для удобства
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    c.id,
    c.user_id,
    u.username,
    u.first_name,
    u.last_name,
    c.status,
    c.created_at,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN users u ON c.user_id = u.telegram_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.user_id, u.username, u.first_name, u.last_name, c.status, c.created_at;

-- 9. Создание функции для установки текущего пользователя
CREATE OR REPLACE FUNCTION set_current_user(user_telegram_id BIGINT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_telegram_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи Telegram';
COMMENT ON TABLE conversations IS 'Диалоги между пользователями и администраторами';
COMMENT ON TABLE messages IS 'Сообщения в диалогах';
COMMENT ON TABLE admins IS 'Администраторы системы';

COMMENT ON COLUMN conversations.status IS 'Статус диалога: open, in_progress, closed, answered';
COMMENT ON COLUMN messages.message_type IS 'Тип сообщения: text, file, image';
COMMENT ON COLUMN admins.role IS 'Роль администратора: admin, super_admin';
