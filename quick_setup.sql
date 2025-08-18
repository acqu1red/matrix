-- Быстрая настройка всех необходимых таблиц

-- 1. Создаем таблицу bot_user
CREATE TABLE IF NOT EXISTS bot_user (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mulacoin INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_free_spin TIMESTAMP WITH TIME ZONE
);

-- 2. Создаем таблицу промокодов
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

-- 3. Создаем таблицу истории квестов
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

-- 4. Создаем таблицу истории рулетки
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

-- 5. Создаем индексы
CREATE INDEX IF NOT EXISTS idx_bot_user_telegram_id ON bot_user(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- 6. Проверяем результат
SELECT 'Созданные таблицы:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bot_user', 'promocodes', 'quest_history', 'roulette_history')
ORDER BY table_name;

SELECT 'Структура bot_user:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bot_user' AND table_schema = 'public'
ORDER BY ordinal_position;
