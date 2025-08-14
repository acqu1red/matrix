# 🚀 Инструкция по настройке бота

## 📋 Обязательные переменные для Railway

### 1. **TELEGRAM_BOT_TOKEN**
```
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
```

### 2. **LAVA_TOP_API_KEY** 
Получите в кабинете [app.lava.top](https://app.lava.top):
- Перейдите в раздел "Интеграция" или "API"
- Скопируйте ваш `X-Api-Key`

### 3. **PRIVATE_CHANNEL_ID**
Получите ID вашего закрытого канала:
1. Добавьте бота в канал как администратора
2. Отправьте любое сообщение в канал
3. Перейдите по ссылке: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Найдите `chat_id` в ответе - это и будет `PRIVATE_CHANNEL_ID`

### 4. **LAVA_OFFER_ID_BASIC**
```
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```

## 🗄️ Настройка базы данных Supabase

### Создание таблицы users

**Вариант 1: Новая таблица**
Выполните SQL скрипт `create_users_table.sql` в Supabase SQL Editor

**Вариант 2: Исправление существующей таблицы**
Если таблица уже существует, но отсутствуют колонки, выполните `fix_users_table.sql`

### Проверка структуры таблицы

После выполнения SQL скрипта проверьте, что таблица создана правильно:

```sql
-- Проверка структуры таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

Таблица должна содержать колонки:
- `id` (SERIAL PRIMARY KEY)
- `telegram_id` (TEXT UNIQUE NOT NULL)
- `email` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

## 🔧 Настройка в Railway

1. **Создайте новый проект** в Railway
2. **Подключите GitHub репозиторий**
3. **Установите переменные окружения**:

```bash
# Обязательные
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
LAVA_TOP_API_KEY=<ваш-ключ-из-app.lava.top>
PRIVATE_CHANNEL_ID=<ID-вашего-канала>
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc

# Опциональные (можно оставить по умолчанию)
LAVA_TOP_API_BASE=https://gate.lava.top
ADMIN_IDS=708907063,7365307696
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
```

4. **Деплой**: Railway автоматически использует `Procfile`

## 🧪 Тестирование

### 1. Проверка webhook
```
GET https://<your-app>.up.railway.app/webhook-info
```

### 2. Сброс webhook
```
POST https://<your-app>.up.railway.app/reset-webhook
```

### 3. Тест бота
```
GET https://<your-app>.up.railway.app/test
```

### 4. Настройка webhook LAVA
В кабинете [app.lava.top](https://app.lava.top):
- URL: `https://<your-app>.up.railway.app/lava-webhook`
- Метод: POST

## 🔄 Рабочий процесс

1. **Пользователь** открывает MiniApp в боте
2. **Заполняет** email и выбирает тариф
3. **Нажимает** "Оплатить" → данные отправляются в бота
4. **Бот** создает инвойс через LAVA TOP Seller API
5. **Пользователь** получает ссылку на оплату
6. **После оплаты** LAVA отправляет webhook
7. **Бот** создает одноразовую инвайт-ссылку и отправляет пользователю

## 🐛 Отладка

### Логи в Railway
Проверяйте логи в Railway Dashboard для отладки

### Проверка переменных
```bash
# Проверка всех переменных
GET https://<your-app>.up.railway.app/test
```

### Проверка webhook
```bash
# Информация о webhook
GET https://<your-app>.up.railway.app/webhook-info
```

## ✅ Готово!

После настройки всех переменных и создания таблицы users бот будет полностью функционален.
