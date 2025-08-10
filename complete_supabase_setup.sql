-- =====================================================
-- ПОЛНАЯ НАСТРОЙКА SUPABASE ДЛЯ TELEGRAM MINIAPP
-- =====================================================

-- Очистка существующих данных (опционально)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- СОЗДАНИЕ ТАБЛИЦ
-- =====================================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- Таблица диалогов
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    admin_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    is_from_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    subscription_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- СОЗДАНИЕ ИНДЕКСОВ
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_telegram_id ON admins(telegram_id);

-- =====================================================
-- ВКЛЮЧЕНИЕ ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- УДАЛЕНИЕ СТАРЫХ ПОЛИТИК
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all" ON users;
DROP POLICY IF EXISTS "Users can insert all" ON users;
DROP POLICY IF EXISTS "Users can update all" ON users;
DROP POLICY IF EXISTS "Users can delete all" ON users;

-- Conversations policies
DROP POLICY IF EXISTS "Conversations can view all" ON conversations;
DROP POLICY IF EXISTS "Conversations can insert all" ON conversations;
DROP POLICY IF EXISTS "Conversations can update all" ON conversations;
DROP POLICY IF EXISTS "Conversations can delete all" ON conversations;

-- Messages policies
DROP POLICY IF EXISTS "Messages can view all" ON messages;
DROP POLICY IF EXISTS "Messages can insert all" ON messages;
DROP POLICY IF EXISTS "Messages can update all" ON messages;
DROP POLICY IF EXISTS "Messages can delete all" ON messages;

-- Payments policies
DROP POLICY IF EXISTS "Payments can view all" ON payments;
DROP POLICY IF EXISTS "Payments can insert all" ON payments;
DROP POLICY IF EXISTS "Payments can update all" ON payments;
DROP POLICY IF EXISTS "Payments can delete all" ON payments;

-- Admins policies
DROP POLICY IF EXISTS "Admins can view all" ON admins;
DROP POLICY IF EXISTS "Admins can insert all" ON admins;
DROP POLICY IF EXISTS "Admins can update all" ON admins;
DROP POLICY IF EXISTS "Admins can delete all" ON admins;

-- =====================================================
-- СОЗДАНИЕ НОВЫХ ПОЛИТИК БЕЗОПАСНОСТИ
-- =====================================================

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
CREATE POLICY "Users can view all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert all" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update all" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete all" ON users FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ CONVERSATIONS
CREATE POLICY "Conversations can view all" ON conversations FOR SELECT USING (true);
CREATE POLICY "Conversations can insert all" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Conversations can update all" ON conversations FOR UPDATE USING (true);
CREATE POLICY "Conversations can delete all" ON conversations FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MESSAGES
CREATE POLICY "Messages can view all" ON messages FOR SELECT USING (true);
CREATE POLICY "Messages can insert all" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages can update all" ON messages FOR UPDATE USING (true);
CREATE POLICY "Messages can delete all" ON messages FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ PAYMENTS
CREATE POLICY "Payments can view all" ON payments FOR SELECT USING (true);
CREATE POLICY "Payments can insert all" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments can update all" ON payments FOR UPDATE USING (true);
CREATE POLICY "Payments can delete all" ON payments FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ ADMINS
CREATE POLICY "Admins can view all" ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can insert all" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update all" ON admins FOR UPDATE USING (true);
CREATE POLICY "Admins can delete all" ON admins FOR DELETE USING (true);

-- =====================================================
-- СОЗДАНИЕ ФУНКЦИЙ
-- =====================================================

-- Удаляем существующие функции (если есть)
DROP FUNCTION IF EXISTS is_admin(BIGINT);
DROP FUNCTION IF EXISTS get_admin_conversations();
DROP FUNCTION IF EXISTS get_conversation_messages(INTEGER);
DROP FUNCTION IF EXISTS get_conversations_stats();
DROP FUNCTION IF EXISTS test_connection();
DROP FUNCTION IF EXISTS check_tables();
DROP FUNCTION IF EXISTS get_conversations_simple();

-- Функция проверки администратора
CREATE OR REPLACE FUNCTION is_admin(user_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE telegram_id = user_telegram_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения диалогов для администратора
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    id INTEGER,
    user_id BIGINT,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    status VARCHAR,
    admin_id BIGINT,
    last_message TEXT,
    message_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        COALESCE(u.username, CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))) as username,
        u.first_name,
        u.last_name,
        c.status,
        c.admin_id,
        m.content as last_message,
        COUNT(*) OVER (PARTITION BY c.id) as message_count,
        c.last_message_at,
        c.created_at
    FROM conversations c
    LEFT JOIN users u ON c.user_id = u.telegram_id
    LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    )
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения сообщений диалога
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    content TEXT,
    sender_id BIGINT,
    sender_is_admin BOOLEAN,
    message_type VARCHAR,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.sender_id,
        a.telegram_id IS NOT NULL as sender_is_admin,
        m.message_type,
        m.is_read,
        m.created_at
    FROM messages m
    LEFT JOIN admins a ON m.sender_id = a.telegram_id AND a.is_active = true
    WHERE m.conversation_id = conv_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения статистики
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

-- Простая функция для тестирования подключения
CREATE OR REPLACE FUNCTION test_connection()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Connection successful';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция проверки таблиц
CREATE OR REPLACE FUNCTION check_tables()
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'users'::TEXT, COUNT(*) FROM users
    UNION ALL
    SELECT 'conversations'::TEXT, COUNT(*) FROM conversations
    UNION ALL
    SELECT 'messages'::TEXT, COUNT(*) FROM messages
    UNION ALL
    SELECT 'admins'::TEXT, COUNT(*) FROM admins
    UNION ALL
    SELECT 'payments'::TEXT, COUNT(*) FROM payments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Простая функция получения диалогов
CREATE OR REPLACE FUNCTION get_conversations_simple()
RETURNS TABLE (
    id INTEGER,
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

-- =====================================================
-- НАЗНАЧЕНИЕ ПРАВ НА ФУНКЦИИ
-- =====================================================

GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO service_role;

GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO service_role;

GRANT EXECUTE ON FUNCTION get_conversation_messages(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_conversation_messages(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_conversations_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_conversations_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_stats() TO service_role;

GRANT EXECUTE ON FUNCTION test_connection() TO anon;
GRANT EXECUTE ON FUNCTION test_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection() TO service_role;

GRANT EXECUTE ON FUNCTION check_tables() TO anon;
GRANT EXECUTE ON FUNCTION check_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION check_tables() TO service_role;

GRANT EXECUTE ON FUNCTION get_conversations_simple() TO anon;
GRANT EXECUTE ON FUNCTION get_conversations_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_simple() TO service_role;

-- =====================================================
-- ВСТАВКА АДМИНИСТРАТОРОВ
-- =====================================================

-- Вставка администраторов в таблицу admins
INSERT INTO admins (telegram_id, username, role, is_active) VALUES 
(708907063, 'admin1', 'admin', true),
(7365307696, 'admin2', 'admin', true)
ON CONFLICT (telegram_id) DO UPDATE SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Обновление пользователей-администраторов (если они уже есть в таблице users)
UPDATE users SET is_admin = TRUE WHERE telegram_id IN (708907063, 7365307696);

-- =====================================================
-- СОЗДАНИЕ ТРИГГЕРОВ ДЛЯ ОБНОВЛЕНИЯ ВРЕМЕНИ
-- =====================================================

-- Триггер для обновления updated_at в conversations
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Триггер для обновления last_message_at в conversations при добавлении сообщения
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- =====================================================

-- Проверяем, что все таблицы созданы
SELECT 'Tables created successfully' as status;

-- Проверяем администраторов
SELECT telegram_id, username, role, is_active FROM admins;

-- Проверяем функции
SELECT routine_name, routine_type FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name IN (
    'is_admin', 'get_admin_conversations', 'get_conversation_messages', 
    'get_conversations_stats', 'test_connection', 'check_tables', 'get_conversations_simple'
);

-- Проверяем политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'conversations', 'messages', 'payments', 'admins');
