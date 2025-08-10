-- =====================================================
-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ ДЛЯ TELEGRAM MINI-APP
-- =====================================================

-- 1. СОЗДАНИЕ ТАБЛИЦ
-- =====================================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица диалогов
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    admin_id BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица администраторов (просто список ID)
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ВСТАВКА АДМИНИСТРАТОРОВ
-- =====================================================

-- Вставляем администраторов
INSERT INTO admins (telegram_id, username) VALUES 
(708907063, 'acqu1red'),
(7365307696, 'admin2')
ON CONFLICT (telegram_id) DO NOTHING;

-- 3. ВКЛЮЧЕНИЕ RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 4. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- =====================================================

-- Разрешаем всем пользователям читать данные пользователей (для отображения имен)
CREATE POLICY "Allow read users" ON users
    FOR SELECT USING (true);

-- Разрешаем всем пользователям создавать/обновлять свои данные
CREATE POLICY "Allow insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update users" ON users
    FOR UPDATE USING (true);

-- 5. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ CONVERSATIONS
-- =====================================================

-- Разрешаем всем пользователям читать диалоги (админы увидят все, обычные пользователи - только свои через функции)
CREATE POLICY "Allow read conversations" ON conversations
    FOR SELECT USING (true);

-- Разрешаем всем пользователям создавать диалоги
CREATE POLICY "Allow insert conversations" ON conversations
    FOR INSERT WITH CHECK (true);

-- Разрешаем всем пользователям обновлять диалоги
CREATE POLICY "Allow update conversations" ON conversations
    FOR UPDATE USING (true);

-- 6. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MESSAGES
-- =====================================================

-- Разрешаем всем пользователям читать сообщения (админы увидят все, обычные пользователи - только свои через функции)
CREATE POLICY "Allow read messages" ON messages
    FOR SELECT USING (true);

-- Разрешаем всем пользователям создавать сообщения
CREATE POLICY "Allow insert messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Разрешаем всем пользователям обновлять сообщения
CREATE POLICY "Allow update messages" ON messages
    FOR UPDATE USING (true);

-- 7. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ ADMINS
-- =====================================================

-- Разрешаем всем читать таблицу администраторов (для проверки прав)
CREATE POLICY "Allow read admins" ON admins
    FOR SELECT USING (true);

-- 8. УДАЛЕНИЕ СТАРЫХ ФУНКЦИЙ И СОЗДАНИЕ НОВЫХ
-- =====================================================

-- Сначала удаляем существующие функции
DROP FUNCTION IF EXISTS is_admin(BIGINT);
DROP FUNCTION IF EXISTS get_admin_conversations();
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT);
DROP FUNCTION IF EXISTS get_conversation_messages(BIGINT, BIGINT);
DROP FUNCTION IF EXISTS get_conversations_stats();
DROP FUNCTION IF EXISTS test_connection();
DROP FUNCTION IF EXISTS check_tables();
DROP FUNCTION IF EXISTS get_conversations_simple();

-- Функция для проверки прав администратора
CREATE OR REPLACE FUNCTION is_admin(user_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE telegram_id = user_telegram_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения диалогов администратора
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    id BIGINT,
    user_id BIGINT,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    status VARCHAR,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message TEXT,
    message_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        COALESCE(u.username, u.first_name, 'Пользователь #' || u.telegram_id::text) as username,
        u.first_name,
        u.last_name,
        c.status,
        COALESCE(
            (SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id),
            c.created_at
        ) as last_message_at,
        COALESCE(
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
            'Нет сообщений'
        ) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
    FROM conversations c
    LEFT JOIN users u ON c.user_id = u.telegram_id
    ORDER BY last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения сообщений диалога (с проверкой прав)
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id BIGINT, user_telegram_id BIGINT DEFAULT NULL)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    sender_id BIGINT,
    sender_is_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Проверяем, является ли пользователь администратором
    IF user_telegram_id IS NOT NULL AND EXISTS(SELECT 1 FROM admins WHERE telegram_id = user_telegram_id) THEN
        -- Администратор может видеть все сообщения
        RETURN QUERY
        SELECT 
            m.id,
            m.content,
            m.sender_id,
            EXISTS(SELECT 1 FROM admins WHERE telegram_id = m.sender_id) as sender_is_admin,
            m.created_at
        FROM messages m
        WHERE m.conversation_id = conv_id
        ORDER BY m.created_at ASC;
    ELSE
        -- Обычный пользователь может видеть только сообщения из своих диалогов
        RETURN QUERY
        SELECT 
            m.id,
            m.content,
            m.sender_id,
            EXISTS(SELECT 1 FROM admins WHERE telegram_id = m.sender_id) as sender_is_admin,
            m.created_at
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.conversation_id = conv_id 
        AND c.user_id = user_telegram_id
        ORDER BY m.created_at ASC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения статистики диалогов
CREATE OR REPLACE FUNCTION get_conversations_stats()
RETURNS TABLE (
    total_conversations BIGINT,
    open_conversations BIGINT,
    total_messages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_conversations,
        COUNT(*) FILTER (WHERE status = 'open') as open_conversations,
        (SELECT COUNT(*) FROM messages) as total_messages
    FROM conversations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Тестовые функции для отладки
CREATE OR REPLACE FUNCTION test_connection()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Connection successful';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_tables()
RETURNS TABLE (table_name TEXT, row_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'users'::TEXT, COUNT(*) FROM users
    UNION ALL
    SELECT 'conversations'::TEXT, COUNT(*) FROM conversations
    UNION ALL
    SELECT 'messages'::TEXT, COUNT(*) FROM messages
    UNION ALL
    SELECT 'admins'::TEXT, COUNT(*) FROM admins;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_conversations_simple()
RETURNS TABLE (
    id BIGINT,
    user_id BIGINT,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.user_id, c.status, c.created_at
    FROM conversations c
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================================

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admins_telegram_id ON admins(telegram_id);

-- 10. ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
-- =====================================================

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
-- =====================================================

/*
1. Скопируйте весь этот код в SQL Editor Supabase
2. Выполните код по частям или целиком
3. Проверьте, что все таблицы созданы в разделе Table Editor
4. Проверьте, что все функции созданы в разделе Database > Functions
5. Проверьте, что RLS включен для всех таблиц

ПРОВЕРКА РАБОТЫ:
- Выполните: SELECT * FROM check_tables();
- Выполните: SELECT test_connection();
- Проверьте администраторов: SELECT * FROM admins;
*/
