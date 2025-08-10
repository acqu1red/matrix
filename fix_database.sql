-- Исправление проблем с базой данных
-- Выполните этот файл в Supabase SQL Editor

-- 1. Удаляем старую функцию
DROP FUNCTION IF EXISTS get_admin_conversations();

-- 2. Создаем простую функцию для получения диалогов
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
        COALESCE(m.content, 'Нет сообщений') as last_message,
        COUNT(m.id) OVER (PARTITION BY c.user_id) as message_count,
        c.last_message_at
    FROM conversations c
    JOIN users u ON c.user_id = u.telegram_id
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) OR m.id IS NULL
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO service_role;

-- 4. Проверяем, что администраторы существуют
INSERT INTO users (telegram_id, username, first_name, last_name, is_admin, subscription_status) VALUES 
(708907063, 'admin1', 'Admin', 'One', TRUE, 'admin'),
(7365307696, 'admin2', 'Admin', 'Two', TRUE, 'admin')
ON CONFLICT (telegram_id) 
DO UPDATE SET 
    is_admin = TRUE,
    subscription_status = 'admin',
    updated_at = NOW();

-- 5. Добавляем администраторов в таблицу admins
INSERT INTO admins (telegram_id, username, role) VALUES 
(708907063, 'admin1', 'admin'),
(7365307696, 'admin2', 'admin')
ON CONFLICT (telegram_id) DO NOTHING;

-- 6. Создаем диалоги для администраторов
INSERT INTO conversations (user_id, status) VALUES 
(708907063, 'open'),
(7365307696, 'open')
ON CONFLICT DO NOTHING;

-- 7. Проверяем политики безопасности
-- Убеждаемся, что все таблицы имеют правильные политики
DO $$
BEGIN
    -- Проверяем политики для users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view all') THEN
        CREATE POLICY "Users can view all" ON users FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert all') THEN
        CREATE POLICY "Users can insert all" ON users FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Проверяем политики для conversations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Conversations can view all') THEN
        CREATE POLICY "Conversations can view all" ON conversations FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Conversations can insert all') THEN
        CREATE POLICY "Conversations can insert all" ON conversations FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Проверяем политики для messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Messages can view all') THEN
        CREATE POLICY "Messages can view all" ON messages FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Messages can insert all') THEN
        CREATE POLICY "Messages can insert all" ON messages FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 8. Проверяем результат
SELECT 
    'Администраторы:' as info,
    u.telegram_id,
    u.username,
    u.is_admin
FROM users u
WHERE u.telegram_id IN (708907063, 7365307696)

UNION ALL

SELECT 
    'Функция создана:' as info,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_conversations') 
         THEN 1 ELSE 0 END,
    0,
    0;
