# Настройка переменных окружения в Railway

## Обязательные переменные

### Telegram Bot
- `TELEGRAM_BOT_TOKEN` - токен бота от BotFather
- `WEBHOOK_URL` - URL вашего приложения в Railway (например: `https://your-app-name.up.railway.app`)
- `WEBHOOK_SECRET` - любая строка для секретного токена вебхука
- `PUBLIC_BASE_URL` - URL вашего приложения в Railway (например: `https://your-app-name.up.railway.app`)

### Lava Top API
- `LAVA_TOP_API_KEY` - ключ API из app.lava.top
- `LAVA_OFFER_ID_BASIC` - ID оффера в Lava Top (`302ecdcd-1581-45ad-8353-a168f347b8cc`)

## Опциональные переменные
- `PAYMENT_MINIAPP_URL` - URL Mini App для оплаты (по умолчанию: `https://acqu1red.github.io/formulaprivate/payment.html`)
- `USE_POLLING` - использовать polling вместо webhook (по умолчанию: `0`)
- `LOG_JSON_BODY` - логировать JSON тела запросов (по умолчанию: `1`)

## Как добавить переменные в Railway

1. Откройте ваш проект в Railway
2. Перейдите в раздел "Variables"
3. Добавьте каждую переменную с соответствующим значением
4. Сохраните изменения
5. Перезапустите приложение

## Проверка после настройки

1. Откройте `https://your-app-name.up.railway.app/webhook-info`
   - `result.url` должен быть `https://your-app-name.up.railway.app/webhook`

2. Если webhook неправильный, используйте `POST /force-set-webhook`

3. Отправьте сообщение боту и нажмите "Оплатить"
   - В логах должно появиться `HTTP IN: {"method":"POST","path":"/webhook", ...}`
   - Бот должен отправить ссылку на оплату

## Пример значений

```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEBHOOK_URL=https://your-app-name.up.railway.app
WEBHOOK_SECRET=my_secret_token_123
PUBLIC_BASE_URL=https://your-app-name.up.railway.app
LAVA_TOP_API_KEY=your_lava_api_key_here
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```
