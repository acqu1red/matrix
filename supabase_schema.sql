-- Supabase SQL Schema для системы поддержки mini app
-- Выполните этот код в SQL Editor в Supabase

-- 1. Таблица пользователей
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

-- 2. Таблица диалогов (поддержка)
CREATE TABLE dialogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) NOT NULL,
    admin_id BIGINT REFERENCES users(telegram_id),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    subject VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Таблица сообщений
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialog_id UUID REFERENCES dialogs(id) ON DELETE CASCADE NOT NULL,
    sender_id BIGINT REFERENCES users(telegram_id) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
    file_url TEXT,
    file_name VARCHAR(255),
    is_from_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Индексы для оптимизации
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_dialogs_user_id ON dialogs(user_id);
CREATE INDEX idx_dialogs_admin_id ON dialogs(admin_id);
CREATE INDEX idx_dialogs_status ON dialogs(status);
CREATE INDEX idx_messages_dialog_id ON messages(dialog_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 5. Триггеры для автоматического обновления updated_at
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

-- 6. RLS (Row Level Security) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политика для пользователей: каждый видит только свои данные + админы видят всё
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (telegram_id = current_setting('app.current_user_id')::BIGINT OR 
                     EXISTS (SELECT 1 FROM users WHERE telegram_id = current_setting('app.current_user_id')::BIGINT AND is_admin = TRUE));

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (telegram_id = current_setting('app.current_user_id')::BIGINT);

-- Политики для диалогов
CREATE POLICY "Users can view own dialogs" ON dialogs
    FOR SELECT USING (user_id = current_setting('app.current_user_id')::BIGINT OR 
                     admin_id = current_setting('app.current_user_id')::BIGINT OR
                     EXISTS (SELECT 1 FROM users WHERE telegram_id = current_setting('app.current_user_id')::BIGINT AND is_admin = TRUE));

CREATE POLICY "Users can create dialogs" ON dialogs
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::BIGINT);

CREATE POLICY "Admins can update dialogs" ON dialogs
    FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE telegram_id = current_setting('app.current_user_id')::BIGINT AND is_admin = TRUE));

-- Политики для сообщений
CREATE POLICY "Users can view messages in their dialogs" ON messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM dialogs d 
        WHERE d.id = dialog_id 
        AND (d.user_id = current_setting('app.current_user_id')::BIGINT OR 
             d.admin_id = current_setting('app.current_user_id')::BIGINT OR
             EXISTS (SELECT 1 FROM users WHERE telegram_id = current_setting('app.current_user_id')::BIGINT AND is_admin = TRUE))
    ));

CREATE POLICY "Users can send messages in their dialogs" ON messages
    FOR INSERT WITH CHECK (sender_id = current_setting('app.current_user_id')::BIGINT);

-- 7. Создание первого админа (замените YOUR_TELEGRAM_ID на ваш Telegram ID)
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES (708907063, 'admin', 'Administrator', TRUE);
VALUES (7365307696, 'admin', 'Administrator', TRUE);

-- 8. Функция для получения статистики диалогов для админа
CREATE OR REPLACE FUNCTION get_admin_dialog_stats()
RETURNS TABLE (
    dialog_id UUID,
    user_telegram_id BIGINT,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    status VARCHAR,
    message_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as dialog_id,
        d.user_id as user_telegram_id,
        u.username,
        u.first_name,
        u.last_name,
        d.status,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at,
        d.created_at
    FROM dialogs d
    JOIN users u ON d.user_id = u.telegram_id
    LEFT JOIN messages m ON d.id = m.dialog_id
    WHERE d.status IN ('open', 'in_progress')
    GROUP BY d.id, d.user_id, u.username, u.first_name, u.last_name, d.status, d.created_at
    ORDER BY COALESCE(MAX(m.created_at), d.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Функция для создания нового диалога
CREATE OR REPLACE FUNCTION create_new_dialog(
    user_telegram_id BIGINT,
    first_message TEXT
)
RETURNS UUID AS $$
DECLARE
    dialog_uuid UUID;
BEGIN
    -- Создаем новый диалог
    INSERT INTO dialogs (user_id, status)
    VALUES (user_telegram_id, 'open')
    RETURNING id INTO dialog_uuid;
    
    -- Добавляем первое сообщение
    INSERT INTO messages (dialog_id, sender_id, content, is_from_admin)
    VALUES (dialog_uuid, user_telegram_id, first_message, FALSE);
    
    RETURN dialog_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Функция для закрытия диалога
CREATE OR REPLACE FUNCTION close_dialog(dialog_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE dialogs 
    SET status = 'closed', closed_at = NOW()
    WHERE id = dialog_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии для использования:
-- 1. Выполните весь код выше в SQL Editor Supabase
-- 2. Замените YOUR_TELEGRAM_ID на ваш реальный Telegram ID в строке создания админа
-- 3. Настройте RLS политики под ваши нужды
-- 4. Используйте функции get_admin_dialog_stats() для получения списка диалогов админом
