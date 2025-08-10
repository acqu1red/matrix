-- Очистка данных в базе (использовать с осторожностью!)

-- Очищаем все сообщения
DELETE FROM messages;

-- Очищаем все диалоги (кроме администраторов)
DELETE FROM conversations WHERE user_id NOT IN (708907063, 7365307696);

-- Очищаем всех пользователей (кроме администраторов)
DELETE FROM users WHERE telegram_id NOT IN (708907063, 7365307696);

-- Очищаем все платежи
DELETE FROM payments;

-- Сбрасываем счетчики автоинкремента
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;

-- Проверяем, что администраторы остались
SELECT 
    u.telegram_id,
    u.username,
    u.first_name,
    u.is_admin
FROM users u
WHERE u.telegram_id IN (708907063, 7365307696);
