
# Исправление Lava Top интеграции (fix3)

Что изменилось:
- Перешли на **POST https://gate.lava.top/api/v2/invoice** с заголовком `X-Api-Key`.
- В запрос передаются `email`, `offerId`, `currency`, `paymentMethod`, `buyerLanguage`, `clientUtm` — по документации.
- В `clientUtm` прокидываем `tg_<id>` → приходит обратно в вебхуке → бот отправляет инвайт **именно этому** пользователю.
- Фронтенд MiniApp всегда отправляет `init_data` — сервер сам достанет `telegram_id`, даже если на клиенте он пустой.
- Маппинг банков: russian → `BANK131/RUB`; international → `UNLIMINT/EUR`.

Проверьте в Railway переменные: TELEGRAM_BOT_TOKEN, TELEGRAM_PRIVATE_CHANNEL_ID, PUBLIC_BASE_URL, LAVA_TOP_API_KEY, LAVA_OFFER_ID_BASIC.
