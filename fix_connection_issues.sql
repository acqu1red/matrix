-- Исправление проблем с подключением к базе данных
-- Выполняйте запросы по одному

-- 1. Проверяем существование таблиц
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bot_user', 'promocodes', 'subscriptions', 'admins', 'quest_history', 'roulette_history');

-- 2. Создаем таблицу bot_user если её нет
CREATE TABLE IF NOT EXISTS bot_user (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  mulacoin INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу promocodes если её нет
CREATE TABLE IF NOT EXISTS promocodes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  issued_to BIGINT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'issued'
);

-- 4. Создаем таблицу quest_history если её нет
CREATE TABLE IF NOT EXISTS quest_history (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  quest_id VARCHAR(100) NOT NULL,
  quest_name VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  mulacoin_earned INTEGER DEFAULT 0,
  experience_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создаем таблицу roulette_history если её нет
CREATE TABLE IF NOT EXISTS roulette_history (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  prize_type VARCHAR(100) NOT NULL,
  prize_name VARCHAR(255) NOT NULL,
  is_free BOOLEAN DEFAULT false,
  mulacoin_spent INTEGER DEFAULT 0,
  promo_code VARCHAR(50),
  spun_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Отключаем RLS для всех таблиц
ALTER TABLE bot_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quest_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 7. Создаем политики для анонимного доступа
DROP POLICY IF EXISTS "Enable all access for bot_user" ON bot_user;
CREATE POLICY "Enable all access for bot_user" ON bot_user FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for promocodes" ON promocodes;
CREATE POLICY "Enable all access for promocodes" ON promocodes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for quest_history" ON quest_history;
CREATE POLICY "Enable all access for quest_history" ON quest_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for roulette_history" ON roulette_history;
CREATE POLICY "Enable all access for roulette_history" ON roulette_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for subscriptions" ON subscriptions;
CREATE POLICY "Enable all access for subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for admins" ON admins;
CREATE POLICY "Enable all access for admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- 8. Включаем RLS обратно
ALTER TABLE bot_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 9. Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('bot_user', 'promocodes', 'subscriptions', 'admins', 'quest_history', 'roulette_history');

-- 10. Тестовые запросы для проверки доступа
SELECT COUNT(*) as bot_user_count FROM bot_user;
SELECT COUNT(*) as promocodes_count FROM promocodes;
SELECT COUNT(*) as quest_history_count FROM quest_history;
SELECT COUNT(*) as roulette_history_count FROM roulette_history;
SELECT COUNT(*) as subscriptions_count FROM subscriptions;
SELECT COUNT(*) as admins_count FROM admins;
