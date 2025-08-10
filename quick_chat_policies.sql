-- =====================================================
-- БЫСТРЫЕ ПОЛИТИКИ ДЛЯ ЧАТА - РЕШЕНИЕ ПРОБЛЕМ С ДОСТУПОМ
-- =====================================================

-- Включаем RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
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

-- Создаем простые политики - ВСЕ РАЗРЕШЕНО
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Проверяем результат
SELECT 'Политики созданы:' as status;
SELECT tablename, COUNT(*) as policies FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'conversations', 'messages', 'admins')
GROUP BY tablename;

SELECT 'Готово! Все пользователи могут писать в чат.' as result;
