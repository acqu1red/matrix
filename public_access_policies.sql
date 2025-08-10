-- Политики открытого доступа для чата
-- Выполните в Supabase SQL Editor

SET search_path TO public;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can read (open)" ON users;
DROP POLICY IF EXISTS "Users can insert (open)" ON users;
DROP POLICY IF EXISTS "Users can update (open)" ON users;

DROP POLICY IF EXISTS "Conversations read (open)" ON conversations;
DROP POLICY IF EXISTS "Conversations insert (open)" ON conversations;
DROP POLICY IF EXISTS "Conversations update (open)" ON conversations;

DROP POLICY IF EXISTS "Messages read (open)" ON messages;
DROP POLICY IF EXISTS "Messages insert (open)" ON messages;
DROP POLICY IF EXISTS "Messages update (open)" ON messages;

-- Включаем RLS
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

-- Проверяем что политики созданы
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'conversations', 'messages')
ORDER BY tablename, policyname;
