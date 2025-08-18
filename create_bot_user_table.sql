-- Создание таблицы bot_user и всех необходимых столбцов

-- ШАГ 1: Проверяем какие таблицы существуют
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ШАГ 2: Создаем таблицу bot_user с базовой структурой
CREATE TABLE IF NOT EXISTS bot_user (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Новые столбцы для системы квестов
  mulacoin INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_free_spin TIMESTAMP WITH TIME ZONE
);

-- ШАГ 3: Создаем таблицу промокодов
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

-- ШАГ 4: Создаем таблицу истории квестов
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

-- ШАГ 5: Создаем таблицу истории рулетки
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

-- ШАГ 6: Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bot_user_telegram_id ON bot_user(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes(issued_to);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- ШАГ 7: Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ШАГ 8: Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_bot_user_updated_at 
    BEFORE UPDATE ON bot_user 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ШАГ 9: Создаем функцию для upsert пользователя
CREATE OR REPLACE FUNCTION upsert_bot_user(
  p_telegram_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  INSERT INTO bot_user (telegram_id, username, first_name, last_name)
  VALUES (p_telegram_id, p_username, p_first_name, p_last_name)
  ON CONFLICT (telegram_id) 
  DO UPDATE SET 
    username = COALESCE(EXCLUDED.username, bot_user.username),
    first_name = COALESCE(EXCLUDED.first_name, bot_user.first_name),
    last_name = COALESCE(EXCLUDED.last_name, bot_user.last_name),
    updated_at = NOW()
  RETURNING id INTO user_uuid;
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ШАГ 10: Создаем функцию для обновления прогресса пользователя
CREATE OR REPLACE FUNCTION update_bot_user_progress(
  p_telegram_id BIGINT,
  p_mulacoin INTEGER DEFAULT NULL,
  p_experience INTEGER DEFAULT NULL,
  p_level INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bot_user 
  SET 
    mulacoin = COALESCE(p_mulacoin, mulacoin),
    experience = COALESCE(p_experience, experience),
    level = COALESCE(p_level, level),
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ШАГ 11: Создаем функцию для проверки возможности бесплатного спина
CREATE OR REPLACE FUNCTION can_spin_free(p_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  last_spin TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_free_spin INTO last_spin
  FROM bot_user 
  WHERE telegram_id = p_telegram_id;
  
  RETURN last_spin IS NULL OR last_spin < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ШАГ 12: Создаем функцию для обновления времени последнего бесплатного спина
CREATE OR REPLACE FUNCTION update_last_free_spin(p_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bot_user 
  SET last_free_spin = NOW(), updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ШАГ 13: Создаем функцию для получения данных пользователя
CREATE OR REPLACE FUNCTION get_bot_user_data(p_telegram_id BIGINT)
RETURNS TABLE(
  user_id UUID,
  telegram_id BIGINT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  mulacoin INTEGER,
  experience INTEGER,
  level INTEGER,
  last_free_spin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bu.id,
    bu.telegram_id,
    bu.username,
    bu.first_name,
    bu.last_name,
    bu.mulacoin,
    bu.experience,
    bu.level,
    bu.last_free_spin,
    bu.created_at,
    bu.updated_at
  FROM bot_user bu
  WHERE bu.telegram_id = p_telegram_id;
END;
$$ LANGUAGE plpgsql;

-- ШАГ 14: Включаем Row Level Security (RLS)
ALTER TABLE bot_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history ENABLE ROW LEVEL SECURITY;

-- ШАГ 15: Создаем политики безопасности
-- Пользователи могут видеть и обновлять только свои данные
CREATE POLICY "Users can view own data" ON bot_user
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON bot_user
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON bot_user
  FOR INSERT WITH CHECK (true);

-- Политики для промокодов
CREATE POLICY "Users can view own promocodes" ON promocodes
  FOR SELECT USING (issued_to = current_setting('app.current_user_id', true)::BIGINT OR 
                   used_by = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Admins can manage all promocodes" ON promocodes
  FOR ALL USING (true);

-- Политики для истории квестов
CREATE POLICY "Users can view own quest history" ON quest_history
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can insert own quest history" ON quest_history
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::BIGINT);

-- Политики для истории рулетки
CREATE POLICY "Users can view own roulette history" ON roulette_history
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can insert own roulette history" ON roulette_history
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::BIGINT);

-- ШАГ 16: Проверяем результат
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

-- ШАГ 17: Проверяем созданные функции
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%bot_user%'
ORDER BY routine_name;
