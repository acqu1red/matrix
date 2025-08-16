-- Создание таблицы подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    days_granted INTEGER NOT NULL,
    granted_by VARCHAR(100) DEFAULT 'admin_command',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Создание индекса для поиска активных подписок
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active) WHERE is_active = TRUE;

-- Создание индекса для поиска по дате окончания
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Добавление ограничения уникальности для активных подписок одного пользователя
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unique_active_user 
ON subscriptions(user_id) WHERE is_active = TRUE;

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

-- Функция для проверки активной подписки пользователя
CREATE OR REPLACE FUNCTION check_user_subscription(user_telegram_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    has_active_subscription BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM subscriptions 
        WHERE user_id = user_telegram_id 
        AND is_active = TRUE 
        AND end_date > NOW()
    ) INTO has_active_subscription;
    
    RETURN has_active_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения информации о подписке пользователя
CREATE OR REPLACE FUNCTION get_user_subscription_info(user_telegram_id BIGINT)
RETURNS TABLE(
    has_subscription BOOLEAN,
    end_date TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.is_active AND s.end_date > NOW() as has_subscription,
        s.end_date,
        GREATEST(0, EXTRACT(EPOCH FROM (s.end_date - NOW())) / 86400)::INTEGER as days_remaining
    FROM subscriptions s
    WHERE s.user_id = user_telegram_id 
    AND s.is_active = TRUE
    ORDER BY s.end_date DESC
    LIMIT 1;
    
    -- Если подписки нет, возвращаем NULL значения
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMP WITH TIME ZONE, 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для автоматического деактивации истекших подписок
CREATE OR REPLACE FUNCTION deactivate_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    deactivated_count INTEGER;
BEGIN
    UPDATE subscriptions 
    SET is_active = FALSE 
    WHERE is_active = TRUE 
    AND end_date <= NOW();
    
    GET DIAGNOSTICS deactivated_count = ROW_COUNT;
    RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии к таблице и функциям
COMMENT ON TABLE subscriptions IS 'Таблица для хранения подписок пользователей на закрытый канал';
COMMENT ON COLUMN subscriptions.user_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN subscriptions.start_date IS 'Дата начала подписки';
COMMENT ON COLUMN subscriptions.end_date IS 'Дата окончания подписки';
COMMENT ON COLUMN subscriptions.is_active IS 'Активна ли подписка';
COMMENT ON COLUMN subscriptions.days_granted IS 'Количество дней, на которые выдана подписка';
COMMENT ON COLUMN subscriptions.granted_by IS 'Кто выдал подписку (admin_command, payment, etc.)';

COMMENT ON FUNCTION check_user_subscription(BIGINT) IS 'Проверяет, есть ли у пользователя активная подписка';
COMMENT ON FUNCTION get_user_subscription_info(BIGINT) IS 'Возвращает информацию о подписке пользователя';
COMMENT ON FUNCTION deactivate_expired_subscriptions() IS 'Автоматически деактивирует истекшие подписки';
