# Диагностика «пустых логов» и отсутствующих апдейтов от Telegram

## 1) Включаем подробные логи HTTP
- В `bot_webhook_app.py` уже есть `@before_request` и `@after_request` — они пишут все входящие запросы (**метод, путь, UA, длина, тип**, а для POST — ещё и **JSON-тело**).
- Переменная `LOG_JSON_BODY=1` включает лог тела запроса (оставь 1 на время диагностики).

## 2) Проверяем токен/вебхук
- Открой:
  - `GET /getme` — должен вернуть данные бота; если ошибка — токен неправильный.
  - `GET /webhook-info` — смотри `url`, `pending_update_count`, `last_error_message`.
- Принудительно выставь вебхук:
  - `POST /force-set-webhook` — сервер вернёт JSON-ответ Telegram API.
  - `POST /delete-webhook` — чтобы сбросить, если нужно.

## 3) Два способа доставки апдейтов
- **Webhooks (боевой режим)** — Telegram шлёт POST на `/webhook`.
- **Polling (диагностика/обход проблем)** — поставь `USE_POLLING=1` и перезапусти. Тогда PTB заберёт апдейты сам, а Flask останется доступен для health/webhook/api.

> Если с polling апдейты пошли — проблема с внешней доступностью `/webhook` или неверным URL в Telegram.

## 4) Проверка Mini App
- Внутри webview должен быть вызов:
  ```js
  const tg = window.Telegram.WebApp;
  tg.ready();
  document.getElementById('pay').addEventListener('click', () => {
    const payload = { email, tariff, bank, currency };
    tg.sendData(JSON.stringify(payload));
  });
  ```
- Альтернатива/дублёр: отправляй напрямую в бекенд:
  ```js
  fetch('https://<your-railway-app>.up.railway.app/api/create-payment', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, tariff:'basic', bank:'russian', currency:'RUB' })
  })
  .then(r=>r.json()).then(console.log);
  ```

## 5) Smoke-тесты
- `GET /health` — ok
- `GET /getme` — ок с данными бота
- `GET /webhook-info` — должен показывать нужный `url`
- `POST /api/create-payment` — вернёт `paymentUrl` (если ключи и offerId верные)

Если логи снова пустые — значит **запросы не доходят** (webhook не выставлен / URL неверный / бот стучится на другой домен).

## 6) Продакшен
- После починки можешь переключиться на gunicorn: `web: gunicorn -w 1 -b 0.0.0.0:$PORT bot_webhook_app:app`.
