-- Диагностический SQL файл для проверки и исправления структуры таблиц

-- 1. Проверяем существующие таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bot_user', 'users', 'admins', 'subscriptions', 'pending_payments')
ORDER BY table_name;

-- 2. Проверяем структуру таблицы bot_user
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Проверяем структуру таблицы users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Проверяем существующие индексы
SELECT 
    t.table_name,
    i.indexname,
    i.indexdef
FROM pg_indexes i
JOIN information_schema.tables t ON i.tablename = t.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('bot_user', 'users')
ORDER BY t.table_name, i.indexname;

-- 5. Проверяем существующие функции
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- 6. Теперь добавляем столбцы пошагово с проверкой

-- Добавляем столбцы в bot_user (если таблица существует)
DO $$
BEGIN
    -- Проверяем существование таблицы bot_user
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_user' AND table_schema = 'public') THEN
        
        -- Добавляем telegram_id если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'telegram_id') THEN
            ALTER TABLE bot_user ADD COLUMN telegram_id BIGINT;
            RAISE NOTICE 'Добавлен столбец telegram_id в bot_user';
        ELSE
            RAISE NOTICE 'Столбец telegram_id уже существует в bot_user';
        END IF;
        
        -- Добавляем mulacoin если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'mulacoin') THEN
            ALTER TABLE bot_user ADD COLUMN mulacoin INTEGER DEFAULT 0;
            RAISE NOTICE 'Добавлен столбец mulacoin в bot_user';
        ELSE
            RAISE NOTICE 'Столбец mulacoin уже существует в bot_user';
        END IF;
        
        -- Добавляем experience если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'experience') THEN
            ALTER TABLE bot_user ADD COLUMN experience INTEGER DEFAULT 0;
            RAISE NOTICE 'Добавлен столбец experience в bot_user';
        ELSE
            RAISE NOTICE 'Столбец experience уже существует в bot_user';
        END IF;
        
        -- Добавляем level если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'level') THEN
            ALTER TABLE bot_user ADD COLUMN level INTEGER DEFAULT 1;
            RAISE NOTICE 'Добавлен столбец level в bot_user';
        ELSE
            RAISE NOTICE 'Столбец level уже существует в bot_user';
        END IF;
        
        -- Добавляем last_free_spin если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'last_free_spin') THEN
            ALTER TABLE bot_user ADD COLUMN last_free_spin TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Добавлен столбец last_free_spin в bot_user';
        ELSE
            RAISE NOTICE 'Столбец last_free_spin уже существует в bot_user';
        END IF;
        
        -- Добавляем updated_at если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bot_user' AND column_name = 'updated_at') THEN
            ALTER TABLE bot_user ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Добавлен столбец updated_at в bot_user';
        ELSE
            RAISE NOTICE 'Столбец updated_at уже существует в bot_user';
        END IF;
        
    ELSE
        RAISE NOTICE 'Таблица bot_user не существует';
    END IF;
END $$;

-- Добавляем столбцы в users (если таблица существует)
DO $$
BEGIN
    -- Проверяем существование таблицы users
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        
        -- Добавляем mulacoin если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mulacoin') THEN
            ALTER TABLE users ADD COLUMN mulacoin INTEGER DEFAULT 0;
            RAISE NOTICE 'Добавлен столбец mulacoin в users';
        ELSE
            RAISE NOTICE 'Столбец mulacoin уже существует в users';
        END IF;
        
        -- Добавляем experience если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'experience') THEN
            ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0;
            RAISE NOTICE 'Добавлен столбец experience в users';
        ELSE
            RAISE NOTICE 'Столбец experience уже существует в users';
        END IF;
        
        -- Добавляем level если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
            ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
            RAISE NOTICE 'Добавлен столбец level в users';
        ELSE
            RAISE NOTICE 'Столбец level уже существует в users';
        END IF;
        
        -- Добавляем last_free_spin если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_free_spin') THEN
            ALTER TABLE users ADD COLUMN last_free_spin TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Добавлен столбец last_free_spin в users';
        ELSE
            RAISE NOTICE 'Столбец last_free_spin уже существует в users';
        END IF;
        
        -- Добавляем updated_at если его нет
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
            ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Добавлен столбец updated_at в users';
        ELSE
            RAISE NOTICE 'Столбец updated_at уже существует в users';
        END IF;
        
    ELSE
        RAISE NOTICE 'Таблица users не существует';
    END IF;
END $$;

-- 7. Создаем новые таблицы с проверкой существования

-- Создаем таблицу промокодов
CREATE TABLE IF NOT EXISTS promocodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'discount', 'frod_course')),
  value INTEGER NOT NULL,
  issued_to BIGINT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'used', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by BIGINT
);

-- Создаем таблицу истории квестов
CREATE TABLE IF NOT EXISTS quest_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT,
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mulacoin_earned INTEGER DEFAULT 0,
  experience_earned INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- Создаем таблицу истории рулетки
CREATE TABLE IF NOT EXISTS roulette_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT,
  prize_type TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  mulacoin_spent INTEGER DEFAULT 0,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  promo_code_id UUID REFERENCES promocodes(id)
);

-- 8. Создаем индексы
CREATE INDEX IF NOT EXISTS idx_bot_user_telegram_id ON bot_user(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes(issued_to);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- 9. Проверяем результат
SELECT 'bot_user' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
AND column_name IN ('telegram_id', 'mulacoin', 'experience', 'level', 'last_free_spin', 'updated_at')
ORDER BY column_name;

SELECT 'users' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('mulacoin', 'experience', 'level', 'last_free_spin', 'updated_at')
ORDER BY column_name;

SELECT 'promocodes' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'promocodes' 
AND table_schema = 'public'
ORDER BY column_name;

SELECT 'quest_history' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'quest_history' 
AND table_schema = 'public'
ORDER BY column_name;

SELECT 'roulette_history' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'roulette_history' 
AND table_schema = 'public'
ORDER BY column_name;
