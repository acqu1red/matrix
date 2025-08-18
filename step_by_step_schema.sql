-- Упрощенный SQL файл для пошагового выполнения
-- Выполняйте каждый блок отдельно

-- ШАГ 1: Проверяем существующие таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ШАГ 2: Проверяем структуру bot_user
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ШАГ 3: Добавляем столбцы в bot_user (выполните этот блок)
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS mulacoin INTEGER DEFAULT 0;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS last_free_spin TIMESTAMP WITH TIME ZONE;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ШАГ 4: Проверяем результат добавления столбцов в bot_user
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ШАГ 5: Создаем таблицу промокодов
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

-- ШАГ 6: Создаем таблицу истории квестов
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

-- ШАГ 7: Создаем таблицу истории рулетки
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

-- ШАГ 8: Создаем индексы
CREATE INDEX IF NOT EXISTS idx_bot_user_telegram_id ON bot_user(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes(issued_to);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- ШАГ 9: Проверяем все созданные таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bot_user', 'promocodes', 'quest_history', 'roulette_history')
ORDER BY table_name;

-- ШАГ 10: Проверяем структуру всех новых таблиц
SELECT 'bot_user' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'bot_user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'promocodes' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'promocodes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'quest_history' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'quest_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'roulette_history' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'roulette_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;
