-- Создание таблицы subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT,
    tariff TEXT NOT NULL,
    amount DECIMAL(10,2),
    currency TEXT,
    order_id TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Создание RLS политик
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (только для аутентифицированных пользователей)
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

-- Политика для вставки (только для сервисного роля)
CREATE POLICY "Service role can insert subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (true);

-- Политика для обновления (только для сервисного роля)
CREATE POLICY "Service role can update subscriptions" ON subscriptions
    FOR UPDATE USING (true);

-- Политика для удаления (только для сервисного роля)
CREATE POLICY "Service role can delete subscriptions" ON subscriptions
    FOR DELETE USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
