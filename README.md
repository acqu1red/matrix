# Telegram + LAVA (Railway-ready)

## Что внутри
- `bot_webhook.py` — единый сервис: Telegram-бот (webhook) + REST эндпоинты
  - `POST /webhook` — входящий вебхук Telegram
  - `POST /api/create-payment` — создание счёта через LAVA Business API (если MiniApp шлёт напрямую)
  - `POST /lava-webhook` — вебхук от LAVA: на `success` бот шлёт инвайт в приватный канал
  - `GET /health` — health‑check
  - `GET /webhook-info` — инфо о текущем вебхуке
  - `POST /reset-webhook` — переустановить вебхук на `PUBLIC_BASE_URL/webhook`

## Быстрый запуск на Railway
1. Создайте новый проект и загрузите этот репозиторий.
2. В **Variables** задайте переменные из `.env.example` (реальные значения!).
3. Убедитесь, что в Procfile:
   ```
   web: python -u bot_webhook.py
   ```
4. После деплоя откройте:
   - `GET https://<домен>/health` — должно вернуть `ok`.
   - `POST https://<домен>/reset-webhook` — привяжет Telegram webhook.
   - `GET https://<домен>/webhook-info` — проверит, что вебхук активен.

## MiniApp → Bot
В вашем `payment.html` по кнопке **Оплатить** должен быть вызов:
```js
Telegram.WebApp.sendData(JSON.stringify({
  price, email, tariff, bank, userId  // любые поля, минимум price
}));
```
Бот ловит `web_app_data`, создаёт инвойс (`/invoice/create`) и отвечает кнопкой с `payUrl`.

## LAVA → Bot (webhook)
После успешной оплаты LAVA шлёт POST на `https://<домен>/lava-webhook`.
Мы читаем `customFields.chat_id`/`user_id` и отправляем пользователю однократную ссылку‑приглашение в закрытый канал.

### Замечания
- При необходимости добавьте проверку статуса через `GET /invoice/status` до отправки инвайта.
- Для подписи входящих вебхуков можно задать `LAVA_WEBHOOK_SECRET` — мы сравниваем HMAC‑SHA256 с заголовком `X-Lava-Signature`/`X-Signature`.

## Секреты
Удалите любые ключи из кода. Используйте переменные окружения (см. `.env.example`).

