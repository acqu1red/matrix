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

-- Создание таблицы промокодов
CREATE TABLE IF NOT EXISTS promocodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'discount', 'frod_course')),
  value INTEGER NOT NULL, -- сумма скидки или количество дней подписки
  issued_to BIGINT REFERENCES users(telegram_id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'used', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by BIGINT REFERENCES users(telegram_id)
);

-- Создание таблицы истории квестов
CREATE TABLE IF NOT EXISTS quest_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id),
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mulacoin_earned INTEGER DEFAULT 0,
  experience_earned INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- Создание таблицы истории рулетки
CREATE TABLE IF NOT EXISTS roulette_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT REFERENCES users(telegram_id),
  prize_type TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  mulacoin_spent INTEGER DEFAULT 0,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  promo_code_id UUID REFERENCES promocodes(id)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_issued_to ON promocodes(issued_to);
CREATE INDEX IF NOT EXISTS idx_quest_history_user_id ON quest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON roulette_history(user_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания пользователя или обновления данных
CREATE OR REPLACE FUNCTION upsert_user(
  p_telegram_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  INSERT INTO users (telegram_id, username, first_name, last_name)
  VALUES (p_telegram_id, p_username, p_first_name, p_last_name)
  ON CONFLICT (telegram_id) 
  DO UPDATE SET 
    username = COALESCE(EXCLUDED.username, users.username),
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    updated_at = NOW()
  RETURNING id INTO user_uuid;
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления валюты и опыта пользователя
CREATE OR REPLACE FUNCTION update_user_progress(
  p_telegram_id BIGINT,
  p_mulacoin_delta INTEGER DEFAULT 0,
  p_experience_delta INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
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
  FROM users 
  WHERE telegram_id = p_telegram_id;
  
  RETURN last_spin IS NULL OR last_spin < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления времени последнего бесплатного прокрута
CREATE OR REPLACE FUNCTION update_last_free_spin(p_telegram_id BIGINT) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET last_free_spin = NOW(), updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history ENABLE ROW LEVEL SECURITY;

-- Политики для users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

-- Политики для promocodes
CREATE POLICY "Users can view own promocodes" ON promocodes
  FOR SELECT USING (issued_to = current_setting('app.telegram_id', true)::BIGINT);

CREATE POLICY "Admins can view all promocodes" ON promocodes
  FOR SELECT USING (current_setting('app.is_admin', true)::BOOLEAN);

-- Политики для quest_history
CREATE POLICY "Users can view own quest history" ON quest_history
  FOR SELECT USING (user_id = current_setting('app.telegram_id', true)::BIGINT);

-- Политики для roulette_history
CREATE POLICY "Users can view own roulette history" ON roulette_history
  FOR SELECT USING (user_id = current_setting('app.telegram_id', true)::BIGINT);
