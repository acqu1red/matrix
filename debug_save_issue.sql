-- Отладка проблемы с сохранением данных
-- Проверяем и исправляем проблемы с mulacoin и опытом

-- 1. Проверяем текущее состояние таблицы bot_user
SELECT 
    'Текущее состояние bot_user' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN mulacoin > 0 THEN 1 END) as users_with_mulacoin,
    COUNT(CASE WHEN experience > 0 THEN 1 END) as users_with_experience,
    COUNT(CASE WHEN level > 1 THEN 1 END) as users_with_levels
FROM bot_user;

-- 2. Проверяем последние обновления
SELECT 
    telegram_id,
    username,
    mulacoin,
    experience,
    level,
    updated_at,
    CASE 
        WHEN updated_at > NOW() - INTERVAL '1 hour' THEN 'Последний час'
        WHEN updated_at > NOW() - INTERVAL '24 hours' THEN 'Последние 24 часа'
        WHEN updated_at > NOW() - INTERVAL '7 days' THEN 'Последняя неделя'
        ELSE 'Старые данные'
    END as activity_period
FROM bot_user
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Проверяем RLS политики для bot_user
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'bot_user';

-- 4. Проверяем статус RLS для bot_user
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Включен'
        ELSE 'RLS Отключен'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bot_user';

-- 5. Создаем тестовую запись (если нужно)
-- INSERT INTO bot_user (telegram_id, username, mulacoin, experience, level, created_at, updated_at)
-- VALUES (123456789, 'test_user', 100, 500, 3, NOW(), NOW())
-- ON CONFLICT (telegram_id) DO UPDATE SET
--     mulacoin = EXCLUDED.mulacoin,
--     experience = EXCLUDED.experience,
--     level = EXCLUDED.level,
--     updated_at = NOW();

-- 6. Проверяем структуру таблицы bot_user
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('mulacoin', 'experience', 'level') THEN 'КРИТИЧЕСКОЕ ПОЛЕ'
        ELSE 'Обычное поле'
    END as importance
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bot_user'
ORDER BY ordinal_position;

-- 7. Проверяем индексы
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'bot_user';

-- 8. Создаем функцию для принудительного обновления пользователя
CREATE OR REPLACE FUNCTION force_update_user(
    p_telegram_id bigint,
    p_mulacoin integer DEFAULT 0,
    p_experience integer DEFAULT 0,
    p_level integer DEFAULT 1
)
RETURNS void AS $$
BEGIN
    INSERT INTO bot_user (telegram_id, mulacoin, experience, level, created_at, updated_at)
    VALUES (p_telegram_id, p_mulacoin, p_experience, p_level, NOW(), NOW())
    ON CONFLICT (telegram_id) DO UPDATE SET
        mulacoin = EXCLUDED.mulacoin,
        experience = EXCLUDED.experience,
        level = EXCLUDED.level,
        updated_at = NOW();
    
    RAISE NOTICE 'Пользователь % обновлен: mulacoin=%, experience=%, level=%', 
        p_telegram_id, p_mulacoin, p_experience, p_level;
END;
$$ LANGUAGE plpgsql;

-- 9. Тестируем функцию обновления (раскомментируйте и замените telegram_id)
-- SELECT force_update_user(123456789, 100, 500, 3);

-- 10. Проверяем логи ошибок (если доступны)
-- SELECT * FROM pg_stat_activity WHERE state = 'active';

-- 11. Создаем функцию для проверки подключения
CREATE OR REPLACE FUNCTION test_connection()
RETURNS text AS $$
BEGIN
    RETURN 'Подключение к базе данных работает';
END;
$$ LANGUAGE plpgsql;

-- 12. Тестируем подключение
SELECT test_connection();

-- 13. Проверяем права доступа
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'bot_user';

-- 14. Создаем функцию для очистки старых данных
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Удаляем пользователей без telegram_id (старше 1 дня)
    DELETE FROM bot_user 
    WHERE telegram_id IS NULL 
    AND created_at < NOW() - INTERVAL '1 day';
    
    -- Удаляем дублирующиеся записи (оставляем только самые новые)
    DELETE FROM bot_user 
    WHERE id NOT IN (
        SELECT DISTINCT ON (telegram_id) id
        FROM bot_user
        WHERE telegram_id IS NOT NULL
        ORDER BY telegram_id, updated_at DESC
    );
    
    RAISE NOTICE 'Очистка старых данных завершена';
END;
$$ LANGUAGE plpgsql;

-- 15. Выполняем очистку (раскомментируйте если нужно)
-- SELECT cleanup_old_data();

-- 16. Финальная проверка
SELECT 
    'Финальная проверка' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN mulacoin > 0 THEN 1 END) as users_with_mulacoin,
    COUNT(CASE WHEN experience > 0 THEN 1 END) as users_with_experience,
    COUNT(CASE WHEN level > 1 THEN 1 END) as users_with_levels,
    MAX(updated_at) as last_update
FROM bot_user;
