# 🔑 Получение данных Lava Top

## 📋 Ваши текущие данные

✅ **API Key:** `whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav`  
✅ **Shop ID:** `1b9f3e05-86aa-4102-9648-268f0f586bb1`  
✅ **Product ID:** `302ecdcd-1581-45ad-8353-a168f347b8cc`  

## 🔍 Где получить недостающие данные

### 1. Secret Key (для API запросов)

1. **Войдите в [Lava Top Dashboard](https://app.lava.top)**
2. **Перейдите в настройки проекта:**
   - Нажмите на ваш проект
   - Найдите раздел "Настройки" или "Settings"
   - Ищите "API" или "Ключи доступа"

3. **Скопируйте Secret Key:**
   - Это НЕ тот же ключ, что и API Key
   - Secret Key обычно длиннее и используется для подписи запросов
   - Может называться "Secret", "Private Key", "Signing Key"

### 2. Webhook Secret (создайте сами)

Это может быть любая случайная строка для безопасности:

```bash
# Примеры webhook secret
lava_webhook_secret_2024_secure_key
my_bot_webhook_secret_12345
telegram_lava_webhook_key_2024
```

## 🔧 Настройка в Lava Top Dashboard

### Шаг 1: Настройка webhook

1. **В Lava Top Dashboard перейдите в:**
   - Настройки проекта → Webhooks
   - Или: Интеграции → Webhooks

2. **Добавьте новый webhook:**
   ```
   URL: https://your-app-name.railway.app/lava-webhook
   Метод: POST
   События: payment.success, payment.failed
   Secret: lava_webhook_secret_2024_secure_key
   ```

### Шаг 2: Проверка настроек

1. **Убедитесь, что webhook активен**
2. **Протестируйте webhook** (если есть такая опция)
3. **Проверьте логи webhook**

## 📝 Полная конфигурация для Railway

В Railway Dashboard → Variables добавьте:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
WEBHOOK_SECRET=your_telegram_webhook_secret

# Supabase
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8

# Lava Top
LAVA_SHOP_ID=1b9f3e05-86aa-4102-9648-268f0f586bb1
LAVA_SECRET_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_WEBHOOK_SECRET=lava_webhook_secret_2024_secure_key
```

## 🧪 Тестирование

### 1. Тестовый платеж
1. Создайте тестовый платеж через Lava Top
2. Проверьте, что webhook сработал
3. Убедитесь, что пользователь получил уведомление

### 2. Проверка логов
1. В Railway Dashboard проверьте логи
2. Убедитесь, что нет ошибок
3. Проверьте, что данные сохраняются в Supabase

## 🆘 Если не можете найти Secret Key

### Альтернативные места поиска:
1. **Раздел "API" или "Интеграции"**
2. **Настройки безопасности**
3. **Ключи доступа**
4. **Подпись запросов**

### Если Secret Key не найден:
1. **Обратитесь в поддержку Lava Top**
2. **Проверьте документацию Lava Top**
3. **Возможно, используется только API Key**

## 📞 Поддержка Lava Top

Если у вас проблемы с получением данных:
- **Email:** support@lava.top
- **Telegram:** @lava_support
- **Документация:** [docs.lava.top](https://docs.lava.top)

## ✅ Чек-лист готовности

- [ ] API Key получен ✅
- [ ] Shop ID получен ✅
- [ ] Secret Key найден (если требуется)
- [ ] Webhook Secret создан
- [ ] Webhook настроен в Lava Top
- [ ] Переменные окружения установлены в Railway
- [ ] Тестовый платеж проведен
- [ ] Логи проверены
