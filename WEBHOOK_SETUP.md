# Настройка Webhook через Railway

## Пошаговая инструкция

### Шаг 1: Подготовка проекта

1. **Убедитесь, что у вас есть все необходимые файлы:**
   - `bot_webhook.py` - основная версия бота с поддержкой webhook
   - `railway.toml` - конфигурация Railway
   - `requirements.txt` - зависимости Python
   - `channel_manager.py` - менеджер каналов
   - `lava_webhook.py` - обработчик платежей Lava Top

2. **Проверьте переменные окружения в коде:**
   - `TELEGRAM_BOT_TOKEN` - токен вашего бота
   - `SUPABASE_URL` и `SUPABASE_KEY` - данные Supabase
   - `LAVA_SHOP_ID` и `LAVA_SECRET_KEY` - данные Lava Top

### Шаг 2: Создание аккаунта на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Зарегистрируйтесь или войдите через GitHub
3. Создайте новый проект

### Шаг 3: Подключение репозитория

1. **Через GitHub:**
   - Нажмите "Deploy from GitHub repo"
   - Выберите ваш репозиторий
   - Railway автоматически определит Python проект

2. **Через локальную папку:**
   - Установите Railway CLI: `npm install -g @railway/cli`
   - Войдите: `railway login`
   - Инициализируйте проект: `railway init`
   - Задеплойте: `railway up`

### Шаг 4: Настройка переменных окружения

В Railway Dashboard перейдите в раздел "Variables" и добавьте:

```env
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
LAVA_SHOP_ID=your_shop_id
LAVA_SECRET_KEY=your_secret_key
LAVA_WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_SECRET=your_telegram_webhook_secret
```

### Шаг 5: Получение URL приложения

1. После деплоя Railway предоставит URL вашего приложения
2. URL будет выглядеть примерно так: `https://your-app-name.railway.app`
3. Скопируйте этот URL

### Шаг 6: Настройка webhook в Telegram

1. **Установите webhook URL:**
   ```
   https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook?url=https://your-app-name.railway.app/webhook
   ```

2. **Проверьте статус webhook:**
   ```
   https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo
   ```

3. **Удалите webhook (если нужно переключиться на polling):**
   ```
   https://api.telegram.org/bot{YOUR_BOT_TOKEN}/deleteWebhook
   ```

### Шаг 7: Настройка Lava Top webhook

1. В панели управления Lava Top перейдите в настройки webhook
2. Установите URL: `https://your-app-name.railway.app/lava-webhook`
3. Укажите секретный ключ (должен совпадать с `LAVA_WEBHOOK_SECRET`)

### Шаг 8: Проверка работы

1. **Проверьте логи в Railway Dashboard**
2. **Отправьте команду `/start` боту**
3. **Проверьте, что сообщения сохраняются в Supabase**
4. **Протестируйте платежную систему**

## Команды для управления webhook

### Установка webhook
```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app-name.railway.app/webhook",
       "secret_token": "your_webhook_secret"
     }'
```

### Проверка статуса
```bash
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"
```

### Удаление webhook
```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/deleteWebhook"
```

## Мониторинг и логи

1. **Railway Dashboard:**
   - Перейдите в раздел "Deployments"
   - Нажмите на последний деплой
   - Просматривайте логи в реальном времени

2. **Проверка здоровья приложения:**
   - Откройте: `https://your-app-name.railway.app/health`
   - Должен вернуться статус "OK"

## Устранение неполадок

### Проблема: Webhook не работает
1. Проверьте URL в настройках webhook
2. Убедитесь, что приложение запущено
3. Проверьте логи на ошибки

### Проблема: Бот не отвечает
1. Проверьте токен бота
2. Убедитесь, что webhook установлен правильно
3. Проверьте переменные окружения

### Проблема: Ошибки в логах
1. Проверьте подключение к Supabase
2. Убедитесь, что все зависимости установлены
3. Проверьте права доступа к базе данных

## Дополнительные настройки

### Настройка домена (опционально)
1. В Railway Dashboard перейдите в "Settings"
2. Добавьте кастомный домен
3. Обновите webhook URL

### Настройка SSL
Railway автоматически предоставляет SSL сертификаты для HTTPS

### Масштабирование
Railway автоматически масштабирует приложение в зависимости от нагрузки

## Безопасность

1. **Никогда не коммитьте токены в репозиторий**
2. **Используйте переменные окружения для всех секретов**
3. **Регулярно обновляйте зависимости**
4. **Мониторьте логи на подозрительную активность**

## Резервное копирование

1. **База данных Supabase:**
   - Настройте автоматические бэкапы
   - Экспортируйте данные регулярно

2. **Код:**
   - Используйте Git для версионирования
   - Создавайте теги для релизов

## Обновление приложения

1. Внесите изменения в код
2. Закоммитьте и запушьте в GitHub
3. Railway автоматически передеплоит приложение
4. Проверьте работу после обновления
