-- Проверка созданных таблиц и их структуры

-- 1. Проверяем все созданные таблицы
SELECT 'Все таблицы в базе данных:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Проверяем структуру таблицы bot_user
SELECT 'Структура таблицы bot_user:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Проверяем структуру таблицы promocodes
SELECT 'Структура таблицы promocodes:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'promocodes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Проверяем структуру таблицы quest_history
SELECT 'Структура таблицы quest_history:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'quest_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Проверяем структуру таблицы roulette_history
SELECT 'Структура таблицы roulette_history:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'roulette_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Проверяем созданные индексы
SELECT 'Созданные индексы:' as info;
SELECT 
    t.table_name,
    i.indexname,
    i.indexdef
FROM pg_indexes i
JOIN information_schema.tables t ON i.tablename = t.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('bot_user', 'promocodes', 'quest_history', 'roulette_history')
ORDER BY t.table_name, i.indexname;

-- 7. Проверяем созданные функции
SELECT 'Созданные функции:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'upsert_bot_user',
    'update_bot_user_progress', 
    'can_spin_free',
    'update_last_free_spin',
    'get_bot_user_data',
    'update_updated_at_column'
)
ORDER BY routine_name;

-- 8. Проверяем созданные триггеры
SELECT 'Созданные триггеры:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'bot_user';

-- 9. Тестируем создание тестового пользователя
SELECT 'Тестируем создание пользователя:' as info;
SELECT upsert_bot_user(123456789, 'test_user', 'Test', 'User') as user_id;

-- 10. Проверяем созданного пользователя
SELECT 'Данные тестового пользователя:' as info;
SELECT * FROM get_bot_user_data(123456789);

-- 11. Тестируем обновление прогресса
SELECT 'Тестируем обновление прогресса:' as info;
SELECT update_bot_user_progress(123456789, 100, 500, 2) as updated;

-- 12. Проверяем обновленные данные
SELECT 'Обновленные данные пользователя:' as info;
SELECT * FROM get_bot_user_data(123456789);

-- 13. Тестируем проверку бесплатного спина
SELECT 'Тестируем проверку бесплатного спина:' as info;
SELECT can_spin_free(123456789) as can_spin;

-- 14. Очищаем тестовые данные
SELECT 'Удаляем тестового пользователя:' as info;
DELETE FROM bot_user WHERE telegram_id = 123456789;
