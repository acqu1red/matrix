-- Максимально открытые политики безопасности для Telegram бота
-- Все пользователи могут читать и писать во все таблицы

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики (если есть)
DROP POLICY IF EXISTS "Users can view all" ON users;
DROP POLICY IF EXISTS "Users can insert all" ON users;
DROP POLICY IF EXISTS "Users can update all" ON users;
DROP POLICY IF EXISTS "Users can delete all" ON users;

DROP POLICY IF EXISTS "Conversations can view all" ON conversations;
DROP POLICY IF EXISTS "Conversations can insert all" ON conversations;
DROP POLICY IF EXISTS "Conversations can update all" ON conversations;
DROP POLICY IF EXISTS "Conversations can delete all" ON conversations;

DROP POLICY IF EXISTS "Messages can view all" ON messages;
DROP POLICY IF EXISTS "Messages can insert all" ON messages;
DROP POLICY IF EXISTS "Messages can update all" ON messages;
DROP POLICY IF EXISTS "Messages can delete all" ON messages;

DROP POLICY IF EXISTS "Payments can view all" ON payments;
DROP POLICY IF EXISTS "Payments can insert all" ON payments;
DROP POLICY IF EXISTS "Payments can update all" ON payments;
DROP POLICY IF EXISTS "Payments can delete all" ON payments;

DROP POLICY IF EXISTS "Admins can view all" ON admins;
DROP POLICY IF EXISTS "Admins can insert all" ON admins;
DROP POLICY IF EXISTS "Admins can update all" ON admins;
DROP POLICY IF EXISTS "Admins can delete all" ON admins;

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- Все пользователи могут просматривать всех пользователей
CREATE POLICY "Users can view all" ON users
    FOR SELECT USING (true);

-- Все пользователи могут создавать записи пользователей
CREATE POLICY "Users can insert all" ON users
    FOR INSERT WITH CHECK (true);

-- Все пользователи могут обновлять записи пользователей
CREATE POLICY "Users can update all" ON users
    FOR UPDATE USING (true);

-- Все пользователи могут удалять записи пользователей
CREATE POLICY "Users can delete all" ON users
    FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ CONVERSATIONS
-- Все пользователи могут просматривать все диалоги
CREATE POLICY "Conversations can view all" ON conversations
    FOR SELECT USING (true);

-- Все пользователи могут создавать диалоги
CREATE POLICY "Conversations can insert all" ON conversations
    FOR INSERT WITH CHECK (true);

-- Все пользователи могут обновлять диалоги
CREATE POLICY "Conversations can update all" ON conversations
    FOR UPDATE USING (true);

-- Все пользователи могут удалять диалоги
CREATE POLICY "Conversations can delete all" ON conversations
    FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MESSAGES
-- Все пользователи могут просматривать все сообщения
CREATE POLICY "Messages can view all" ON messages
    FOR SELECT USING (true);

-- Все пользователи могут создавать сообщения
CREATE POLICY "Messages can insert all" ON messages
    FOR INSERT WITH CHECK (true);

-- Все пользователи могут обновлять сообщения
CREATE POLICY "Messages can update all" ON messages
    FOR UPDATE USING (true);

-- Все пользователи могут удалять сообщения
CREATE POLICY "Messages can delete all" ON messages
    FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ PAYMENTS
-- Все пользователи могут просматривать все платежи
CREATE POLICY "Payments can view all" ON payments
    FOR SELECT USING (true);

-- Все пользователи могут создавать платежи
CREATE POLICY "Payments can insert all" ON payments
    FOR INSERT WITH CHECK (true);

-- Все пользователи могут обновлять платежи
CREATE POLICY "Payments can update all" ON payments
    FOR UPDATE USING (true);

-- Все пользователи могут удалять платежи
CREATE POLICY "Payments can delete all" ON payments
    FOR DELETE USING (true);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ ADMINS
-- Все пользователи могут просматривать всех администраторов
CREATE POLICY "Admins can view all" ON admins
    FOR SELECT USING (true);

-- Все пользователи могут создавать записи администраторов
CREATE POLICY "Admins can insert all" ON admins
    FOR INSERT WITH CHECK (true);

-- Все пользователи могут обновлять записи администраторов
CREATE POLICY "Admins can update all" ON admins
    FOR UPDATE USING (true);

-- Все пользователи могут удалять записи администраторов
CREATE POLICY "Admins can delete all" ON admins
    FOR DELETE USING (true);

-- Удаляем старую функцию (если существует)
DROP FUNCTION IF EXISTS get_admin_conversations();

-- Создаем функцию для получения диалогов администратора
CREATE OR REPLACE FUNCTION get_admin_conversations()
RETURNS TABLE (
    user_id BIGINT,
    username VARCHAR,
    last_message TEXT,
    message_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.telegram_id as user_id,
        COALESCE(u.username, CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))) as username,
        m.content as last_message,
        COUNT(*) OVER (PARTITION BY c.user_id) as message_count,
        c.last_message_at
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    )
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Даем права на выполнение функции всем пользователям
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO service_role;
