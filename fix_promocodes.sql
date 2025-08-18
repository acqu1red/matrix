-- Проверка и исправление данных в таблице promocodes
-- Убеждаемся, что промокоды правильно привязаны к пользователям

-- 1. Проверяем структуру таблицы promocodes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'promocodes'
ORDER BY ordinal_position;

-- 2. Проверяем существующие промокоды
SELECT 
    id,
    code,
    type,
    value,
    issued_to,
    issued_at,
    expires_at,
    status,
    used_at,
    used_by
FROM promocodes
ORDER BY issued_at DESC
LIMIT 10;

-- 3. Проверяем, есть ли промокоды без привязки к пользователю
SELECT 
    COUNT(*) as promocodes_without_user,
    COUNT(CASE WHEN issued_to IS NULL THEN 1 END) as null_issued_to,
    COUNT(CASE WHEN issued_to = 0 THEN 1 END) as zero_issued_to
FROM promocodes;

-- 4. Проверяем соответствие с таблицей bot_user
SELECT 
    p.code,
    p.issued_to,
    p.status,
    CASE 
        WHEN bu.telegram_id IS NOT NULL THEN 'User exists'
        ELSE 'User not found'
    END as user_status
FROM promocodes p
LEFT JOIN bot_user bu ON p.issued_to = bu.telegram_id
ORDER BY p.issued_at DESC
LIMIT 10;

-- 5. Создаем функцию для исправления промокодов без привязки
CREATE OR REPLACE FUNCTION fix_orphaned_promocodes()
RETURNS void AS $$
BEGIN
    -- Удаляем промокоды без привязки к пользователю (старше 1 дня)
    DELETE FROM promocodes 
    WHERE issued_to IS NULL 
    AND issued_at < NOW() - INTERVAL '1 day';
    
    RAISE NOTICE 'Orphaned promocodes cleaned up';
END;
$$ LANGUAGE plpgsql;

-- 6. Выполняем очистку (раскомментируйте если нужно)
-- SELECT fix_orphaned_promocodes();

-- 7. Проверяем RLS политики для promocodes
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'promocodes';

-- 8. Создаем индекс для быстрого поиска по коду (если не существует)
CREATE INDEX IF NOT EXISTS idx_promocodes_code_lookup ON promocodes USING btree (code);

-- 9. Создаем индекс для поиска по issued_to (если не существует)
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes USING btree (issued_to);

-- 10. Проверяем статистику по типам промокодов
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued_count,
    COUNT(CASE WHEN status = 'used' THEN 1 END) as used_count,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_count
FROM promocodes
GROUP BY type
ORDER BY total_count DESC;
