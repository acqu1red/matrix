-- Скрипт для добавления администратора
-- Замените YOUR_TELEGRAM_ID на ваш Telegram ID

-- Добавление пользователя (если его нет)
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (YOUR_TELEGRAM_ID, 'your_username', 'Your', 'Name')
ON CONFLICT (telegram_id) DO NOTHING;

-- Добавление администратора
INSERT INTO admins (user_id, role) 
VALUES (YOUR_TELEGRAM_ID, 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Проверка
SELECT 
    u.telegram_id,
    u.username,
    u.first_name,
    a.role as admin_role
FROM users u
LEFT JOIN admins a ON u.telegram_id = a.user_id
WHERE u.telegram_id = YOUR_TELEGRAM_ID;
