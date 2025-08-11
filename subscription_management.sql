-- Создание таблицы подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    tariff VARCHAR(50) NOT NULL,
    price_rub INTEGER NOT NULL,
    price_eur DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    subscription_status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    channel_invite_sent BOOLEAN DEFAULT FALSE,
    channel_joined BOOLEAN DEFAULT FALSE,
    channel_member_id BIGINT,
    order_id VARCHAR(255),
    payment_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(subscription_status);

-- Создание таблицы для отслеживания попыток входа в канал
CREATE TABLE IF NOT EXISTS channel_join_attempts (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    email VARCHAR(255),
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    subscription_id INTEGER REFERENCES subscriptions(id)
);

-- Создание таблицы для логов операций
CREATE TABLE IF NOT EXISTS subscription_logs (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Функция для проверки активных подписок
CREATE OR REPLACE FUNCTION get_active_subscriptions()
RETURNS TABLE (
    user_id BIGINT,
    telegram_username VARCHAR(255),
    email VARCHAR(255),
    tariff VARCHAR(50),
    end_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.user_id, s.telegram_username, s.email, s.tariff, s.end_date
    FROM subscriptions s
    WHERE s.subscription_status = 'active' 
    AND s.end_date > CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения истекших подписок
CREATE OR REPLACE FUNCTION get_expired_subscriptions()
RETURNS TABLE (
    user_id BIGINT,
    telegram_username VARCHAR(255),
    email VARCHAR(255),
    subscription_id INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.user_id, s.telegram_username, s.email, s.id
    FROM subscriptions s
    WHERE s.subscription_status = 'active' 
    AND s.end_date <= CURRENT_TIMESTAMP
    AND s.channel_joined = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Функция для продления подписки
CREATE OR REPLACE FUNCTION extend_subscription(
    p_user_id BIGINT,
    p_tariff VARCHAR(50),
    p_price_rub INTEGER,
    p_price_eur DECIMAL(10,2)
)
RETURNS INTEGER AS $$
DECLARE
    subscription_id INTEGER;
    new_end_date TIMESTAMP;
BEGIN
    -- Получаем текущую подписку
    SELECT id, end_date INTO subscription_id, new_end_date
    FROM subscriptions 
    WHERE user_id = p_user_id AND subscription_status = 'active'
    ORDER BY end_date DESC LIMIT 1;
    
    -- Если подписка существует, продлеваем её
    IF subscription_id IS NOT NULL THEN
        -- Вычисляем новую дату окончания
        CASE p_tariff
            WHEN '1_month' THEN new_end_date := new_end_date + INTERVAL '1 month';
            WHEN '6_months' THEN new_end_date := new_end_date + INTERVAL '6 months';
            WHEN '12_months' THEN new_end_date := new_end_date + INTERVAL '12 months';
        END CASE;
        
        -- Обновляем подписку
        UPDATE subscriptions 
        SET tariff = p_tariff,
            price_rub = p_price_rub,
            price_eur = p_price_eur,
            end_date = new_end_date,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = subscription_id;
        
        -- Логируем продление
        INSERT INTO subscription_logs (subscription_id, action, details)
        VALUES (subscription_id, 'subscription_extended', 
                jsonb_build_object('new_tariff', p_tariff, 'new_end_date', new_end_date));
        
        RETURN subscription_id;
    ELSE
        -- Создаем новую подписку
        CASE p_tariff
            WHEN '1_month' THEN new_end_date := CURRENT_TIMESTAMP + INTERVAL '1 month';
            WHEN '6_months' THEN new_end_date := CURRENT_TIMESTAMP + INTERVAL '6 months';
            WHEN '12_months' THEN new_end_date := CURRENT_TIMESTAMP + INTERVAL '12 months';
        END CASE;
        
        INSERT INTO subscriptions (user_id, tariff, price_rub, price_eur, end_date)
        VALUES (p_user_id, p_tariff, p_price_rub, p_price_eur, new_end_date)
        RETURNING id INTO subscription_id;
        
        -- Логируем создание
        INSERT INTO subscription_logs (subscription_id, action, details)
        VALUES (subscription_id, 'subscription_created', 
                jsonb_build_object('tariff', p_tariff, 'end_date', new_end_date));
        
        RETURN subscription_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
