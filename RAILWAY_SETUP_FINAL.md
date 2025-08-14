# 🚀 Настройка Railway для Telegram Bot + LAVA TOP

## Переменные окружения для Railway

Добавьте следующие переменные в Railway Variables:

```
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
LAVA_TOP_API_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
PRIVATE_CHANNEL_ID=-1001234567890
ADMIN_IDS=708907063,7365307696
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
PAYMENT_MINIAPP_URL=https://acqu1red.github.io/formulaprivate/payment.html
```

## База данных Supabase

Выполните SQL скрипт в Supabase SQL Editor:

```sql
-- Создание таблицы bot_users
CREATE TABLE IF NOT EXISTS bot_users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram_id ON bot_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_email ON bot_users(email);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_users_updated_at 
    BEFORE UPDATE ON bot_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## LAVA TOP Webhook

В настройках LAVA TOP добавьте webhook URL:
```
https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook
```

## Проверка работы

1. Бот должен автоматически установить webhook при запуске
2. MiniApp доступен по адресу: https://acqu1red.github.io/formulaprivate/payment.html
3. Базовый тариф: 50 рублей
4. После оплаты бот автоматически отправит ссылку в приватный канал

## Логи

Проверяйте логи в Railway для диагностики проблем.
