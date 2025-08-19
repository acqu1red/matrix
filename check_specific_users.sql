-- Проверка конкретных пользователей с правильными названиями полей
-- Выполняйте запросы по одному

-- 1. Проверяем админов в таблице admins
SELECT * FROM admins;

-- 2. Проверяем подписки для конкретных пользователей
SELECT * FROM subscriptions WHERE user_id = '708907063';
SELECT * FROM subscriptions WHERE user_id = '7365307696';

-- 3. Проверяем активные подписки для конкретных пользователей
SELECT * FROM subscriptions WHERE user_id = '708907063' AND status = 'active';
SELECT * FROM subscriptions WHERE user_id = '7365307696' AND status = 'active';

-- 4. Проверяем все активные подписки
SELECT * FROM subscriptions WHERE status = 'active';

-- 5. Проверяем количество записей
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT COUNT(*) as active_subscriptions FROM subscriptions WHERE status = 'active';
