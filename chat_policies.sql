-- =====================================================
-- ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ ЧАТА - ДОСТУП ВСЕМ ПОЛЬЗОВАТЕЛЯМ
-- =====================================================

-- Включаем RLS для всех таблиц чата
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- УДАЛЕНИЕ СТАРЫХ ПОЛИТИК
-- =====================================================

-- Удаляем все существующие политики для таблиц чата
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

DROP POLICY IF EXISTS "Admins can view all" ON admins;
DROP POLICY IF EXISTS "Admins can insert all" ON admins;
DROP POLICY IF EXISTS "Admins can update all" ON admins;
DROP POLICY IF EXISTS "Admins can delete all" ON admins;

-- =====================================================
-- СОЗДАНИЕ НОВЫХ ПОЛИТИК - МАКСИМАЛЬНО ОТКРЫТЫЙ ДОСТУП
-- =====================================================

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

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ ПОЛИТИКИ ДЛЯ АНОНИМНЫХ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

-- Политики для анонимных пользователей (если нужно)
CREATE POLICY "Anonymous users can view users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Anonymous users can insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous users can view conversations" ON conversations
    FOR SELECT USING (true);

CREATE POLICY "Anonymous users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous users can view messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Anonymous users can insert messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous users can view admins" ON admins
    FOR SELECT USING (true);

-- =====================================================
-- ПРОВЕРКА ПОЛИТИК
-- =====================================================

-- Проверяем, что все политики созданы
SELECT 'Проверка политик безопасности:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'WITH CONDITION'
        ELSE 'NO CONDITION'
    END as condition_type
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'admins')
ORDER BY tablename, cmd;

-- Подсчитываем количество политик для каждой таблицы
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(cmd, ', ' ORDER BY cmd) as operations
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'admins')
GROUP BY tablename
ORDER BY tablename;

-- Проверяем статус RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'conversations', 'messages', 'admins')
ORDER BY tablename;

-- =====================================================
-- ТЕСТОВЫЕ ЗАПРОСЫ ДЛЯ ПРОВЕРКИ ДОСТУПА
-- =====================================================

-- Тест 1: Проверка доступа к таблице users
SELECT 'Тест доступа к users:' as test_name;
SELECT COUNT(*) as users_count FROM users;

-- Тест 2: Проверка доступа к таблице conversations
SELECT 'Тест доступа к conversations:' as test_name;
SELECT COUNT(*) as conversations_count FROM conversations;

-- Тест 3: Проверка доступа к таблице messages
SELECT 'Тест доступа к messages:' as test_name;
SELECT COUNT(*) as messages_count FROM messages;

-- Тест 4: Проверка доступа к таблице admins
SELECT 'Тест доступа к admins:' as test_name;
SELECT COUNT(*) as admins_count FROM admins;

-- Тест 5: Проверка создания тестовых данных
SELECT 'Тест создания данных:' as test_name;

-- Создаем тестового пользователя
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (888888888, 'test_chat_user', 'Test', 'ChatUser')
ON CONFLICT (telegram_id) DO NOTHING;

-- Создаем тестовый диалог
INSERT INTO conversations (user_id, status) 
VALUES (888888888, 'open')
ON CONFLICT DO NOTHING;

-- Создаем тестовое сообщение
INSERT INTO messages (conversation_id, sender_id, content, message_type) 
SELECT c.id, 888888888, 'Тестовое сообщение из политик', 'text'
FROM conversations c 
WHERE c.user_id = 888888888 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Проверяем созданные данные
SELECT 
    'Тестовые данные созданы' as status,
    (SELECT COUNT(*) FROM users WHERE telegram_id = 888888888) as users_count,
    (SELECT COUNT(*) FROM conversations WHERE user_id = 888888888) as conversations_count,
    (SELECT COUNT(*) FROM messages m 
     JOIN conversations c ON m.conversation_id = c.id 
     WHERE c.user_id = 888888888) as messages_count;

-- Очистка тестовых данных
DELETE FROM messages WHERE sender_id = 888888888;
DELETE FROM conversations WHERE user_id = 888888888;
DELETE FROM users WHERE telegram_id = 888888888;

SELECT 'Политики безопасности настроены успешно!' as final_status;
