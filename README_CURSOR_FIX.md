# Быстрый старт (APP LAVA TOP)
1) Скопируй файлы из архива.
2) Procfile: `web: python bot_webhook_app.py`.
3) Railway env — из `example.env` (ключ именно из app.lava.top).
4) В app.lava.top → Webhooks: https://<your-railway-app>.up.railway.app/lava-webhook, включи payment.success.
5) Деплой и проверь: /health, /webhook-info, /api/create-payment.
