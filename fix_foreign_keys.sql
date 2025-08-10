-- =====================================================
-- ИСПРАВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ И ЦЕЛОСТНОСТИ ДАННЫХ
-- =====================================================

-- Удаляем существующие внешние ключи (если есть)
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Создаем новые внешние ключи с правильными настройками
ALTER TABLE conversations 
ADD CONSTRAINT conversations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(telegram_id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE payments 
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(telegram_id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Добавляем внешний ключ для admin_id в conversations
ALTER TABLE conversations 
ADD CONSTRAINT conversations_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES users(telegram_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =====================================================

-- Индекс для поиска по статусу диалогов
CREATE INDEX IF NOT EXISTS idx_conversations_status_created ON conversations(status, created_at);

-- Индекс для поиска сообщений по времени
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Индекс для поиска пользователей по активности
CREATE INDEX IF NOT EXISTS idx_users_active_admin ON users(is_active, is_admin);

-- =====================================================
-- ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ДАННЫХ
-- =====================================================

-- Обновляем is_from_admin в сообщениях на основе таблицы admins
UPDATE messages 
SET is_from_admin = true 
WHERE sender_id IN (SELECT telegram_id FROM admins WHERE is_active = true);

-- Обновляем статус диалогов, которые имеют админа
UPDATE conversations 
SET status = 'answered' 
WHERE admin_id IS NOT NULL AND status = 'open';

-- =====================================================
-- ПРОВЕРКА ЦЕЛОСТНОСТИ
-- =====================================================

-- Проверяем, что все внешние ключи созданы
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('conversations', 'messages', 'payments');

-- Проверяем количество записей в каждой таблице
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
