# Информация об офферах

## Полученные данные от Lava.top API

### Основной offerId
```
302ecdcd-1581-45ad-8353-a168f347b8cc
```

### Созданные инвойсы для тестирования

#### 6 месяцев (PERIOD_180_DAYS)
- **ID инвойса**: `8b8a40a6-3758-4c2b-ad02-55ed77be42d6`
- **Сумма**: 3,990 RUB
- **Периодичность**: PERIOD_180_DAYS
- **Статус**: in-progress

#### 12 месяцев (PERIOD_YEAR)
- **ID инвойса**: `23725ede-adeb-41fe-979b-7dcc5da02ee8`
- **Сумма**: 7,790 RUB
- **Периодичность**: PERIOD_YEAR
- **Статус**: in-progress

### Тестирование успешно пройдено ✅
Все инвойсы создаются корректно с правильными суммами и периодичностями.

## Где нужно настроить

### 1. Railway (основное приложение)
В файле `bot_webhook_app.py` уже обновлен код для поддержки периодичности. Приложение автоматически будет использовать правильную периодичность в зависимости от выбранного тарифа.

### 2. Переменные окружения
Убедитесь, что в Railway настроена только одна переменная:
- `LAVA_OFFER_ID_BASIC` = `302ecdcd-1581-45ad-8353-a168f347b8cc`

**Важно**: Дополнительные переменные для 6 и 12 месяцев НЕ нужны, так как Lava.top поддерживает разные периодичности через один offerId.

### 3. Обновленные цены
- 1 месяц: 790 ₽ (MONTHLY)
- 6 месяцев: 3,990 ₽ (PERIOD_180_DAYS) - экономия 810 ₽
- 12 месяцев: 7,790 ₽ (PERIOD_YEAR) - экономия 1,810 ₽

## Как это работает

1. Пользователь выбирает тариф в MiniApp
2. Frontend отправляет `periodicity` в API
3. API создает инвойс с правильной периодичностью используя один базовый offerId
4. Lava.top обрабатывает платеж и создает подписку с соответствующей периодичностью

## Важные моменты

- **Один offerId для всех тарифов**: Lava.top поддерживает разные периодичности через один offerId
- **Дополнительные переменные НЕ нужны**: Достаточно только `LAVA_OFFER_ID_BASIC`
- **Автоматическое ценообразование**: Lava.top автоматически применяет правильные цены для каждой периодичности

## Тестирование

Для тестирования можно использовать созданные инвойсы или создавать новые через API:

```bash
# 6 месяцев
curl -X POST 'https://gate.lava.top/api/v2/invoice' \
  -H 'accept: application/json' -H 'Content-Type: application/json' \
  -H 'X-Api-Key: YOUR_API_KEY' \
  -d '{
    "email": "test@example.com",
    "offerId": "302ecdcd-1581-45ad-8353-a168f347b8cc",
    "periodicity": "PERIOD_180_DAYS",
    "currency": "RUB",
    "paymentMethod": "BANK131",
    "buyerLanguage": "RU"
  }'

# 12 месяцев
curl -X POST 'https://gate.lava.top/api/v2/invoice' \
  -H 'accept: application/json' -H 'Content-Type: application/json' \
  -H 'X-Api-Key: YOUR_API_KEY' \
  -d '{
    "email": "test@example.com",
    "offerId": "302ecdcd-1581-45ad-8353-a168f347b8cc",
    "periodicity": "PERIOD_YEAR",
    "currency": "RUB",
    "paymentMethod": "BANK131",
    "buyerLanguage": "RU"
  }'
```
