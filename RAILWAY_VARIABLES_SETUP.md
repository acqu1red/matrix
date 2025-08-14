# Настройка переменных окружения в Railway

## 🚀 Быстрая настройка

В Railway → Variables добавьте следующие переменные:

### Обязательные переменные:

```env
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
WEBHOOK_URL=https://formulaprivate-productionpaymentuknow.up.railway.app
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
LAVA_TOP_API_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```

### Опциональные переменные:

```env
PAYMENT_MINIAPP_URL=https://acqu1red.github.io/formulaprivate/payment.html
USE_POLLING=0
LOG_JSON_BODY=1
```

## 📋 Описание переменных

| Переменная | Значение | Описание |
|------------|----------|----------|
| `TELEGRAM_BOT_TOKEN` | `7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc` | Токен бота от @BotFather |
| `WEBHOOK_URL` | `https://formulaprivate-productionpaymentuknow.up.railway.app` | URL вашего Railway приложения |
| `WEBHOOK_SECRET` | `Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c` | Секрет для Telegram webhook |
| `LAVA_TOP_API_KEY` | `whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav` | API ключ из app.lava.top |
| `LAVA_OFFER_ID_BASIC` | `302ecdcd-1581-45ad-8353-a168f347b8cc` | ID оффера "basic" в LAVA |
| `PAYMENT_MINIAPP_URL` | `https://acqu1red.github.io/formulaprivate/payment.html` | URL Mini App для оплаты |
| `USE_POLLING` | `0` | 0=webhook, 1=polling |
| `LOG_JSON_BODY` | `1` | 1=логировать JSON, 0=не логировать |

## 🔧 Настройка в Railway

1. Откройте ваш проект в Railway
2. Перейдите в раздел **Variables**
3. Добавьте каждую переменную по отдельности
4. Нажмите **Deploy** для применения изменений

## ✅ Проверка настройки

После деплоя проверьте:

1. **Health check:**
   ```
   GET https://formulaprivate-productionpaymentuknow.up.railway.app/health
   ```

2. **Проверка бота:**
   ```
   GET https://formulaprivate-productionpaymentuknow.up.railway.app/getme
   ```

3. **Проверка webhook:**
   ```
   GET https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info
   ```

## 🎯 Готово!

После настройки всех переменных ваш бот будет готов к работе с LAVA TOP API!
