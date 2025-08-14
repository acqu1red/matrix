-- Диагностика таблицы users

-- Проверяем, существует ли таблица
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'users'
) AS table_exists;

-- Показываем все колонки в таблице
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Показываем ограничения таблицы
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'users';

-- Показываем индексы
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users';
