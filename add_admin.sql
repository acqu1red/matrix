-- Добавление администраторов в базу данных

-- Добавляем администраторов в таблицу users
INSERT INTO users (telegram_id, username, first_name, last_name, is_admin, subscription_status) VALUES 
(708907063, 'admin1', 'Admin', 'One', TRUE, 'admin'),
(7365307696, 'admin2', 'Admin', 'Two', TRUE, 'admin')
ON CONFLICT (telegram_id) 
DO UPDATE SET 
    is_admin = TRUE,
    subscription_status = 'admin',
    updated_at = NOW();

-- Добавляем администраторов в таблицу admins
INSERT INTO admins (telegram_id, username, role) VALUES 
(708907063, 'admin1', 'admin'),
(7365307696, 'admin2', 'admin')
ON CONFLICT (telegram_id) DO NOTHING;

-- Создаем диалоги для администраторов (если их нет)
INSERT INTO conversations (user_id, status) VALUES 
(708907063, 'open'),
(7365307696, 'open')
ON CONFLICT DO NOTHING;

-- Проверяем, что администраторы добавлены
SELECT 
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    u.is_admin,
    a.role as admin_role
FROM users u
LEFT JOIN admins a ON u.telegram_id = a.telegram_id
WHERE u.telegram_id IN (708907063, 7365307696);
