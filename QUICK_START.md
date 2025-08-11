# 🚀 Быстрый старт: Webhook через Railway

## ⚡ Экспресс-настройка (5 минут)

### 1. Подготовка
```bash
# Убедитесь, что у вас есть все файлы
ls -la
# Должны быть: bot_webhook.py, railway.toml, requirements.txt
```

### 2. Создание проекта на Railway
1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Дождитесь автоматического деплоя

### 3. Настройка переменных окружения
В Railway Dashboard → Variables добавьте:
```env
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
LAVA_SHOP_ID=1b9f3e05-86aa-4102-9648-268f0f586bb1
LAVA_SECRET_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
WEBHOOK_SECRET=telegram_webhook_secret_2024
LAVA_WEBHOOK_SECRET=lava_webhook_secret_2024_secure_key
```

### 4. Получение URL
После деплоя скопируйте URL из Railway Dashboard:
```
https://your-app-name.railway.app
```

### 5. Установка webhook
```bash
# Установите переменную окружения
export WEBHOOK_URL="https://your-app-name.railway.app"

# Запустите скрипт настройки
python setup_webhook.py setup
```

### 6. Проверка работы
```bash
# Проверьте статус
python setup_webhook.py status

# Отправьте /start боту
```

## 🔧 Альтернативная настройка через браузер

### Установка webhook
Откройте в браузере:
```
https://api.telegram.org/bot7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc/setWebhook?url=https://your-app-name.railway.app/webhook
```

### Проверка статуса
```
https://api.telegram.org/bot7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc/getWebhookInfo
```

## ✅ Проверка работоспособности

1. **Откройте health check:**
   ```
   https://your-app-name.railway.app/health
   ```

2. **Отправьте команду боту:**
   ```
   /start
   ```

3. **Проверьте логи в Railway Dashboard**

## 🆘 Если что-то не работает

### Проблема: Бот не отвечает
```bash
# Удалите webhook и переключитесь на polling
python setup_webhook.py delete
```

### Проблема: Ошибки в логах
1. Проверьте переменные окружения
2. Убедитесь, что все зависимости установлены
3. Проверьте подключение к Supabase

### Проблема: Webhook не устанавливается
1. Убедитесь, что приложение запущено
2. Проверьте URL на доступность
3. Убедитесь, что используется HTTPS

## 📞 Быстрая помощь

Если нужна помощь:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все шаги выполнены
3. Проверьте статус webhook: `python setup_webhook.py status`

## 🎯 Что должно работать после настройки

✅ Бот отвечает на команды  
✅ Сообщения сохраняются в Supabase  
✅ Администраторы получают уведомления  
✅ Платежная система работает  
✅ Webhook обрабатывает платежи Lava Top  
