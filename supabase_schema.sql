-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  mulacoin INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_free_spin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Дополнение существующих таблиц для поддержки новой функциональности

-- Добавляем поля в существующую таблицу users для поддержки mulacoin и уровней
ALTER TABLE users ADD COLUMN IF NOT EXISTS mulacoin INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_free_spin TIMESTAMP WITH TIME ZONE;

-- Добавляем поля в существующую таблицу bot_user для поддержки Telegram ID
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS mulacoin INTEGER DEFAULT 0;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS last_free_spin TIMESTAMP WITH TIME ZONE;

-- Создаем таблицу промокодов (если её нет)
CREATE TABLE IF NOT EXISTS promocodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'discount', 'frod_course')),
  value INTEGER NOT NULL, -- сумма скидки или количество дней подписки
  issued_to BIGINT, -- telegram_id пользователя
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'used', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by BIGINT -- telegram_id пользователя, который использовал
);

-- Создаем таблицу истории квестов
CREATE TABLE IF NOT EXISTS quest_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT, -- telegram_id пользователя
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
  user_id BIGINT, -- telegram_id пользователя
  prize_type TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  mulacoin_spent INTEGER DEFAULT 0,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  promo_code_id UUID REFERENCES promocodes(id)
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_bot_user_telegram_id ON bot_user(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes(issued_to);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- Функция для обновления updated_at (если её нет)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в users (если поля updated_at нет, создадим его)
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
CREATE TRIGGER IF NOT EXISTS update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для автоматического обновления updated_at в bot_user (если поля updated_at нет, создадим его)
ALTER TABLE bot_user ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
CREATE TRIGGER IF NOT EXISTS update_bot_user_updated_at BEFORE UPDATE ON bot_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания/обновления пользователя в bot_user
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

-- Функция для обновления валюты и опыта пользователя в bot_user
CREATE OR REPLACE FUNCTION update_bot_user_progress(
  p_telegram_id BIGINT,
  p_mulacoin_delta INTEGER DEFAULT 0,
  p_experience_delta INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bot_user 
  SET 
    mulacoin = mulacoin + p_mulacoin_delta,
    experience = experience + p_experience_delta,
    level = CASE 
      WHEN experience + p_experience_delta >= 100 THEN 2
      WHEN experience + p_experience_delta >= 300 THEN 3
      WHEN experience + p_experience_delta >= 600 THEN 4
      WHEN experience + p_experience_delta >= 1000 THEN 5
      WHEN experience + p_experience_delta >= 1500 THEN 6
      WHEN experience + p_experience_delta >= 2100 THEN 7
      WHEN experience + p_experience_delta >= 2800 THEN 8
      WHEN experience + p_experience_delta >= 3600 THEN 9
      WHEN experience + p_experience_delta >= 4500 THEN 10
      ELSE level
    END,
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки возможности бесплатного прокрута
CREATE OR REPLACE FUNCTION can_spin_free(p_telegram_id BIGINT) RETURNS BOOLEAN AS $$
DECLARE
  last_spin TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_free_spin INTO last_spin
  FROM bot_user 
  WHERE telegram_id = p_telegram_id;
  
  RETURN last_spin IS NULL OR last_spin < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления времени последнего бесплатного прокрута
CREATE OR REPLACE FUNCTION update_last_free_spin(p_telegram_id BIGINT) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bot_user 
  SET last_free_spin = NOW(), updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения данных пользователя
CREATE OR REPLACE FUNCTION get_bot_user_data(p_telegram_id BIGINT) 
RETURNS TABLE(
  mulacoin INTEGER,
  experience INTEGER,
  level INTEGER,
  last_free_spin TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bu.mulacoin,
    bu.experience,
    bu.level,
    bu.last_free_spin
  FROM bot_user bu
  WHERE bu.telegram_id = p_telegram_id;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) политики для новых таблиц
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history ENABLE ROW LEVEL SECURITY;

-- Политики для promocodes
CREATE POLICY "Users can view own promocodes" ON promocodes
  FOR SELECT USING (issued_to = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Admins can view all promocodes" ON promocodes
  FOR SELECT USING (current_setting('app.is_admin', true)::BOOLEAN);

CREATE POLICY "Admins can insert promocodes" ON promocodes
  FOR INSERT WITH CHECK (current_setting('app.is_admin', true)::BOOLEAN);

CREATE POLICY "Admins can update promocodes" ON promocodes
  FOR UPDATE USING (current_setting('app.is_admin', true)::BOOLEAN);

-- Политики для quest_history
CREATE POLICY "Users can view own quest history" ON quest_history
  FOR SELECT USING (user_id = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Users can insert own quest history" ON quest_history
  FOR INSERT WITH CHECK (user_id = current_setting('app.telegram_id', true)::BIGINT);

-- Политики для roulette_history
CREATE POLICY "Users can view own roulette history" ON roulette_history
  FOR SELECT USING (user_id = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Users can insert own roulette history" ON roulette_history
  FOR INSERT WITH CHECK (user_id = current_setting('app.telegram_id', true)::BIGINT);

-- Политики для bot_user (если RLS включен)
ALTER TABLE bot_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot_user data" ON bot_user
  FOR SELECT USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Users can update own bot_user data" ON bot_user
  FOR UPDATE USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Users can insert own bot_user data" ON bot_user
  FOR INSERT WITH CHECK (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

-- Политики для admins (если RLS включен)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (current_setting('app.is_admin', true)::BOOLEAN);

-- Комментарии для понимания структуры
COMMENT ON TABLE bot_user IS 'Основная таблица пользователей бота с поддержкой mulacoin и уровней';
COMMENT ON TABLE promocodes IS 'Промокоды для скидок, подписок и курсов';
COMMENT ON TABLE quest_history IS 'История прохождения квестов пользователями';
COMMENT ON TABLE roulette_history IS 'История прокрутов рулетки';
COMMENT ON COLUMN bot_user.telegram_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN bot_user.mulacoin IS 'Внутриигровая валюта пользователя';
COMMENT ON COLUMN bot_user.experience IS 'Опыт пользователя для уровней';
COMMENT ON COLUMN bot_user.level IS 'Уровень пользователя';
COMMENT ON COLUMN bot_user.last_free_spin IS 'Время последнего бесплатного прокрута рулетки';
