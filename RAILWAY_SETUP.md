# 🚀 Настройка Railway с вашим API ключом

## ✅ Ваш API ключ готов к использованию

**LAVA_TOP_API_KEY:** `whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav`

## 🔧 Установка в Railway

### 1. Откройте Railway Dashboard
- Перейдите на [railway.app](https://railway.app)
- Войдите в свой аккаунт
- Найдите проект `formulaprivate-productionpaymentuknow`

### 2. Перейдите в Variables
- В меню проекта найдите "Variables"
- Нажмите "New Variable"

### 3. Добавьте переменную
```
Name: LAVA_TOP_API_KEY
Value: whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
```

### 4. Сохраните и дождитесь перезапуска
- Railway автоматически перезапустит деплой
- Дождитесь завершения деплоя (обычно 1-2 минуты)

## 🧪 Проверка после установки

### Тест 1: Проверка переменных
```bash
curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test"
```

**Ожидаемый результат:**
```json
{
  "status": "ok",
  "lava_api_key_set": true,
  "lava_api_key_preview": "whjKvjpi2o..."
}
```

### Тест 2: Создание инвойса
```bash
curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test-invoice"
```

**Ожидаемый результат:**
```json
{
  "status": "success",
  "payment_url": "https://app.lava.top/...",
  "lava_api_key_set": true
}
```

## 📋 Полный список переменных для Railway

```bash
# ОБЯЗАТЕЛЬНО
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
LAVA_TOP_API_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
PRIVATE_CHANNEL_ID=-1002717275103
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc

# ОПЦИОНАЛЬНО
LAVA_TOP_API_BASE=https://gate.lava.top
LAVA_TOP_WEBHOOK_SECRET=<если включена подпись>
ADMIN_IDS=708907063,7365307696
PUBLIC_BASE_URL=https://formulaprivate-productionpaymentuknow.up.railway.app
PAYMENT_MINIAPP_URL=https://acqu1red.github.io/formulaprivate/
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
```

## 🎯 Что делать дальше

1. **Установите LAVA_TOP_API_KEY в Railway**
2. **Получите PRIVATE_CHANNEL_ID** (добавьте бота в канал и получите ID)
3. **Создайте таблицу bot_users в Supabase**
4. **Настройте webhook в LAVA TOP** (если нужно)

## 🔍 Если что-то не работает

Проверьте логи в Railway Dashboard:
1. Перейдите в "Deployments"
2. Выберите последний деплой
3. Нажмите "View Logs"
4. Ищите ошибки с `LAVA_TOP_API_KEY`
