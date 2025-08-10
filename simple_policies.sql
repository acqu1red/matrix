-- Упрощенные политики безопасности для тестирования
-- Выполните этот скрипт ПОСЛЕ создания таблиц

-- Отключаем RLS для тестирования
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Предоставляем права на все таблицы
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON admins TO anon, authenticated;

-- Предоставляем права на последовательности
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Предоставляем права на выполнение функций
GRANT EXECUTE ON FUNCTION is_admin(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_admin_conversations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_messages(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_current_user(BIGINT) TO anon, authenticated;

-- Вставка тестового администратора (замените на ваш Telegram ID)
-- Раскомментируйте и замените YOUR_TELEGRAM_ID на ваш ID
/*
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (YOUR_TELEGRAM_ID, 'your_username', 'Your', 'Name')
ON CONFLICT (telegram_id) DO NOTHING;

INSERT INTO admins (user_id, role) 
VALUES (YOUR_TELEGRAM_ID, 'admin')
ON CONFLICT (user_id) DO NOTHING;
*/

-- Проверка создания таблиц
SELECT 'Tables created successfully!' as status;
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as row_count FROM admins;
