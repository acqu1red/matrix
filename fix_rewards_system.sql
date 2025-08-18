-- Проверка и исправление системы наград в базе данных
-- Убеждаемся, что mulacoin и опыт правильно сохраняются

-- 1. Проверяем структуру таблицы bot_user
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bot_user'
ORDER BY ordinal_position;

-- 2. Проверяем текущие данные пользователей
SELECT 
    id,
    telegram_id,
    username,
    first_name,
    mulacoin,
    experience,
    level,
    last_free_spin,
    created_at,
    updated_at
FROM bot_user
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Проверяем статистику по mulacoin и опыту
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN mulacoin > 0 THEN 1 END) as users_with_mulacoin,
    COUNT(CASE WHEN experience > 0 THEN 1 END) as users_with_experience,
    AVG(mulacoin) as avg_mulacoin,
    AVG(experience) as avg_experience,
    MAX(mulacoin) as max_mulacoin,
    MAX(experience) as max_experience,
    MAX(level) as max_level
FROM bot_user;

-- 4. Проверяем историю квестов
SELECT 
    COUNT(*) as total_quests,
    COUNT(CASE WHEN mulacoin_earned > 0 THEN 1 END) as quests_with_mulacoin,
    COUNT(CASE WHEN experience_earned > 0 THEN 1 END) as quests_with_experience,
    SUM(mulacoin_earned) as total_mulacoin_earned,
    SUM(experience_earned) as total_experience_earned,
    AVG(mulacoin_earned) as avg_mulacoin_per_quest,
    AVG(experience_earned) as avg_experience_per_quest
FROM quest_history;

-- 5. Проверяем историю рулетки
SELECT 
    COUNT(*) as total_spins,
    COUNT(CASE WHEN is_free THEN 1 END) as free_spins,
    COUNT(CASE WHEN NOT is_free THEN 1 END) as paid_spins,
    COUNT(CASE WHEN mulacoin_spent > 0 THEN 1 END) as spins_with_cost,
    SUM(mulacoin_spent) as total_mulacoin_spent,
    AVG(mulacoin_spent) as avg_mulacoin_spent
FROM roulette_history;

-- 6. Проверяем промокоды
SELECT 
    COUNT(*) as total_promocodes,
    COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued_promocodes,
    COUNT(CASE WHEN status = 'used' THEN 1 END) as used_promocodes,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_promocodes,
    COUNT(CASE WHEN issued_to IS NOT NULL THEN 1 END) as promocodes_with_user
FROM promocodes;

-- 7. Создаем функцию для проверки целостности данных пользователя
CREATE OR REPLACE FUNCTION check_user_data_integrity()
RETURNS TABLE (
    telegram_id bigint,
    username text,
    mulacoin integer,
    experience integer,
    level integer,
    calculated_level integer,
    level_mismatch boolean,
    last_activity timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bu.telegram_id,
        bu.username,
        bu.mulacoin,
        bu.experience,
        bu.level,
        CASE 
            WHEN bu.experience < 100 THEN 1
            WHEN bu.experience < 300 THEN 2
            WHEN bu.experience < 600 THEN 3
            WHEN bu.experience < 1000 THEN 4
            WHEN bu.experience < 1500 THEN 5
            WHEN bu.experience < 2100 THEN 6
            WHEN bu.experience < 2800 THEN 7
            WHEN bu.experience < 3600 THEN 8
            WHEN bu.experience < 4500 THEN 9
            WHEN bu.experience < 5500 THEN 10
            WHEN bu.experience < 6600 THEN 11
            WHEN bu.experience < 7800 THEN 12
            WHEN bu.experience < 9100 THEN 13
            WHEN bu.experience < 10500 THEN 14
            WHEN bu.experience < 12000 THEN 15
            WHEN bu.experience < 13600 THEN 16
            WHEN bu.experience < 15300 THEN 17
            WHEN bu.experience < 17100 THEN 18
            WHEN bu.experience < 19000 THEN 19
            WHEN bu.experience < 21000 THEN 20
            ELSE 21
        END as calculated_level,
        CASE 
            WHEN bu.level != CASE 
                WHEN bu.experience < 100 THEN 1
                WHEN bu.experience < 300 THEN 2
                WHEN bu.experience < 600 THEN 3
                WHEN bu.experience < 1000 THEN 4
                WHEN bu.experience < 1500 THEN 5
                WHEN bu.experience < 2100 THEN 6
                WHEN bu.experience < 2800 THEN 7
                WHEN bu.experience < 3600 THEN 8
                                WHEN bu.experience < 4500 THEN 9
                                WHEN bu.experience < 5500 THEN 10
                                WHEN bu.experience < 6600 THEN 11
                                WHEN bu.experience < 7800 THEN 12
                                WHEN bu.experience < 9100 THEN 13
                                WHEN bu.experience < 10500 THEN 14
                                WHEN bu.experience < 12000 THEN 15
                                WHEN bu.experience < 13600 THEN 16
                                WHEN bu.experience < 15300 THEN 17
                                WHEN bu.experience < 17100 THEN 18
                                WHEN bu.experience < 19000 THEN 19
                                WHEN bu.experience < 21000 THEN 20
                                ELSE 21
                            END THEN true
            ELSE false
        END as level_mismatch,
        bu.updated_at as last_activity
    FROM bot_user bu
    ORDER BY bu.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Проверяем целостность данных пользователей
SELECT * FROM check_user_data_integrity() WHERE level_mismatch = true;

-- 9. Создаем функцию для исправления уровней
CREATE OR REPLACE FUNCTION fix_user_levels()
RETURNS void AS $$
BEGIN
    UPDATE bot_user 
    SET level = CASE 
        WHEN experience < 100 THEN 1
        WHEN experience < 300 THEN 2
        WHEN experience < 600 THEN 3
        WHEN experience < 1000 THEN 4
        WHEN experience < 1500 THEN 5
        WHEN experience < 2100 THEN 6
        WHEN experience < 2800 THEN 7
        WHEN experience < 3600 THEN 8
        WHEN experience < 4500 THEN 9
        WHEN experience < 5500 THEN 10
        WHEN experience < 6600 THEN 11
        WHEN experience < 7800 THEN 12
        WHEN experience < 9100 THEN 13
        WHEN experience < 10500 THEN 14
        WHEN experience < 12000 THEN 15
        WHEN experience < 13600 THEN 16
        WHEN experience < 15300 THEN 17
        WHEN experience < 17100 THEN 18
        WHEN experience < 19000 THEN 19
        WHEN experience < 21000 THEN 20
        ELSE 21
    END,
    updated_at = NOW()
    WHERE level != CASE 
        WHEN experience < 100 THEN 1
        WHEN experience < 300 THEN 2
        WHEN experience < 600 THEN 3
        WHEN experience < 1000 THEN 4
        WHEN experience < 1500 THEN 5
        WHEN experience < 2100 THEN 6
        WHEN experience < 2800 THEN 7
        WHEN experience < 3600 THEN 8
        WHEN experience < 4500 THEN 9
        WHEN experience < 5500 THEN 10
        WHEN experience < 6600 THEN 11
        WHEN experience < 7800 THEN 12
        WHEN experience < 9100 THEN 13
        WHEN experience < 10500 THEN 14
        WHEN experience < 12000 THEN 15
        WHEN experience < 13600 THEN 16
        WHEN experience < 15300 THEN 17
        WHEN experience < 17100 THEN 18
        WHEN experience < 19000 THEN 19
        WHEN experience < 21000 THEN 20
        ELSE 21
    END;
    
    RAISE NOTICE 'User levels fixed';
END;
$$ LANGUAGE plpgsql;

-- 10. Исправляем уровни (раскомментируйте если нужно)
-- SELECT fix_user_levels();

-- 11. Проверяем активность пользователей за последние 24 часа
SELECT 
    COUNT(*) as active_users_24h,
    COUNT(CASE WHEN mulacoin > 0 THEN 1 END) as users_with_mulacoin_24h,
    COUNT(CASE WHEN experience > 0 THEN 1 END) as users_with_experience_24h
FROM bot_user 
WHERE updated_at > NOW() - INTERVAL '24 hours';
