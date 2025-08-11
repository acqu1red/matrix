-- Создание таблицы для ожидающих платежей
CREATE TABLE IF NOT EXISTS pending_payments (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    tariff VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'RUB',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_order_id ON pending_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at);

-- RLS политики
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (только для аутентифицированных пользователей)
CREATE POLICY "Users can view their own pending payments" ON pending_payments
    FOR SELECT USING (auth.uid()::text = user_id);

-- Политика для вставки (только для аутентифицированных пользователей)
CREATE POLICY "Users can insert their own pending payments" ON pending_payments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Политика для обновления (только для аутентифицированных пользователей)
CREATE POLICY "Users can update their own pending payments" ON pending_payments
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Политика для удаления (только для аутентифицированных пользователей)
CREATE POLICY "Users can delete their own pending payments" ON pending_payments
    FOR DELETE USING (auth.uid()::text = user_id);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_payments_updated_at 
    BEFORE UPDATE ON pending_payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице
COMMENT ON TABLE pending_payments IS 'Таблица для хранения ожидающих платежей';
COMMENT ON COLUMN pending_payments.order_id IS 'Уникальный ID заказа';
COMMENT ON COLUMN pending_payments.user_id IS 'ID пользователя Telegram';
COMMENT ON COLUMN pending_payments.tariff IS 'Название тарифа';
COMMENT ON COLUMN pending_payments.amount IS 'Сумма платежа';
COMMENT ON COLUMN pending_payments.currency IS 'Валюта платежа';
COMMENT ON COLUMN pending_payments.status IS 'Статус платежа (pending, success, failed)';
COMMENT ON COLUMN pending_payments.metadata IS 'Дополнительные данные платежа в формате JSON';
COMMENT ON COLUMN pending_payments.created_at IS 'Время создания записи';
COMMENT ON COLUMN pending_payments.updated_at IS 'Время последнего обновления записи';
