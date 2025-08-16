-- Функция для проверки прав администратора
CREATE OR REPLACE FUNCTION is_admin(user_telegram_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Проверяем, является ли пользователь администратором
    -- ID администраторов: 708907063, 7365307696
    RETURN user_telegram_id IN ('708907063', '7365307696');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарий к функции
COMMENT ON FUNCTION is_admin(TEXT) IS 'Проверяет, является ли пользователь с указанным Telegram ID администратором';

-- Проверяем, что функция создана
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'is_admin';
