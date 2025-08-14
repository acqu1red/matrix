# Инструкция по настройке Railway

## 1. Переменные окружения (Railway → Variables)

Заполните строго по `example.env`:

```
TELEGRAM_BOT_TOKEN=<токен бота от BotFather>
WEBHOOK_URL=https://formulaprivate-productionpaymentuknow.up.railway.app
WEBHOOK_SECRET=<любой_строковый_секрет>
LAVA_TOP_API_KEY=<ключ из app.lava.top>
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
PAYMENT_MINIAPP_URL=https://acqu1red.github.io/formulaprivate/payment.html
USE_POLLING=0
LOG_JSON_BODY=1
```

**Важно:** 
- Ключ именно из `app.lava.top`, а не из `business.lava`
- `WEBHOOK_URL` должен быть реальным URL вашего Railway приложения
- `WEBHOOK_SECRET` - любая строка для безопасности

## 2. Procfile

Уже настроен:
```
web: python bot_webhook_app.py
```

## 3. Диагностика после деплоя

### Проверка токена бота:
```
GET https://formulaprivate-productionpaymentuknow.up.railway.app/getme
```

### Проверка webhook:
```
GET https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info
```

### Принудительная установка webhook:
```
POST https://formulaprivate-productionpaymentuknow.up.railway.app/force-set-webhook
```

## 4. Проверка логов

В Railway Logs должны появиться:
- `HTTP {"method":"POST","path":"/webhook", ... "tg-secret":"present"}`
- `TELEGRAM RAW: {...}` - сырое тело апдейта

## 5. Если webhook не работает

Включите polling временно:
```
USE_POLLING=1
```

## 6. Продакшен режим

Когда всё работает, переходите на gunicorn:
```
web: gunicorn -w 1 -b 0.0.0.0:$PORT bot_webhook_app:app
```

## Статус
✅ **Готово к деплою на Railway**
