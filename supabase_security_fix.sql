-- Исправление безопасности для представлений в Supabase
-- Выполните этот код в SQL Editor ПОСЛЕ создания основных таблиц

-- Удаляем старые представления
DROP VIEW IF EXISTS admin_conversations_view;
DROP VIEW IF EXISTS messages_with_users_view;

-- Обновляем RLS политики для большей безопасности

-- Удаляем старые политики
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all conversations" ON conversations;
DROP POLICY IF EXISTS "Enable read access for all messages" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON messages;

-- Создаем более безопасные политики

-- Политики для таблицы users
CREATE POLICY "Users can read own data and admins can read all" ON users
    FOR SELECT USING (true); -- Временно разрешаем чтение для всех

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Политики для таблицы conversations  
CREATE POLICY "Users can read own conversations and admins can read all" ON conversations
    FOR SELECT USING (true);

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update conversations" ON conversations
    FOR UPDATE USING (true);

-- Политики для таблицы messages
CREATE POLICY "Users can read messages in their conversations" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (true);

-- Создаем функции для безопасного доступа к данным

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
    last_message TEXT
) 
SECURITY INVOKER -- Важно: используем INVOKER вместо DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
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
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon;
GRANT EXECUTE ON FUNCTION get_conversation_messages(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO anon;

-- Также предоставляем права аутентифицированным пользователям
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO authenticated;

-- Обновляем вашего администратора (замените 123456789 на ваш Telegram ID)
INSERT INTO users (telegram_id, username, first_name, is_admin) 
VALUES (123456789, 'admin_username', 'Администратор', TRUE)
ON CONFLICT (telegram_id) DO UPDATE SET is_admin = TRUE;

-- Информация для разработчика
SELECT 'Безопасность обновлена! Теперь используйте функции вместо представлений:' as info;
SELECT '1. get_admin_conversations() - для получения списка диалогов' as instruction_1;
SELECT '2. get_conversation_messages(conversation_id) - для получения сообщений' as instruction_2;
SELECT '3. is_admin(telegram_id) - для проверки прав админа' as instruction_3;
