#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment - FIXED VERSION
"""

import os
import logging
import requests
import json
import base64
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from supabase import create_client, Client

# Создаем Flask приложение для health check
app = Flask(__name__)

# Health check endpoint для Railway
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "telegram-bot-webhook"})

# Тестовый endpoint для проверки работы бота
@app.route('/test', methods=['GET'])
def test_bot():
    return jsonify({
        "status": "ok",
        "message": "Бот работает!",
        "telegram_token": TELEGRAM_BOT_TOKEN[:20] + "...",
        "lava_shop_id": LAVA_SHOP_ID,
        "webhook_url": f"https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
    })

# Endpoint для проверки webhook info
@app.route('/webhook-info', methods=['GET'])
def webhook_info():
    """Показывает информацию о текущем webhook"""
    try:
        webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        response = requests.get(webhook_url)
        webhook_data = response.json()
        
        print(f"📋 Webhook info: {webhook_data}")
        
        return jsonify({
            "status": "ok",
            "webhook_info": webhook_data,
            "bot_token": TELEGRAM_BOT_TOKEN[:20] + "...",
            "expected_url": "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            "current_url": webhook_data.get('result', {}).get('url', ''),
            "pending_updates": webhook_data.get('result', {}).get('pending_update_count', 0)
        })
    except Exception as e:
        print(f"❌ Ошибка получения webhook info: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Endpoint для принудительной переустановки webhook
@app.route('/reset-webhook', methods=['GET'])
def reset_webhook():
    """Принудительно переустанавливает webhook"""
    try:
        # Удаляем старый webhook
        delete_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
        delete_response = requests.post(delete_url)
        print(f"🗑️ Удаление webhook: {delete_response.status_code} - {delete_response.text}")
        
        import time
        time.sleep(2)
        
        # Устанавливаем новый webhook
        webhook_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
        set_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
        webhook_data = {
            "url": webhook_url,
            "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c'),
            "max_connections": 40,
            "allowed_updates": ["message", "callback_query"]
        }
        
        set_response = requests.post(set_url, json=webhook_data)
        print(f"📡 Ответ установки webhook: {set_response.status_code} - {set_response.text}")
        
        return jsonify({
            "status": "ok",
            "webhook_url": webhook_url,
            "delete_response": delete_response.json(),
            "set_response": set_response.json()
        })
    except Exception as e:
        print(f"❌ Ошибка сброса webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Webhook endpoint для Telegram
@app.route('/webhook', methods=['GET', 'POST'])
def telegram_webhook():
    """Обрабатывает webhook от Telegram"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН WEBHOOK ОТ TELEGRAM!")
        print("=" * 50)
        print(f"📋 Method: {request.method}")
        print(f"📋 URL: {request.url}")
        print(f"📋 Headers: {dict(request.headers)}")
        
        # Обрабатываем GET запросы (проверка доступности)
        if request.method == 'GET':
            print("✅ GET запрос - проверка доступности webhook")
            return jsonify({
                "status": "ok", 
                "message": "Telegram webhook endpoint доступен",
                "method": "GET",
                "timestamp": datetime.now().isoformat()
            })
        
        # Получаем данные от Telegram (только для POST)
        data = request.get_json()
        print(f"📋 Данные от Telegram: {data}")
        
        # Проверяем, что это действительно от Telegram
        if not data:
            print("❌ Данные пустые или не JSON")
            return jsonify({"status": "error", "message": "No data"}), 400
        
        if 'update_id' not in data:
            print("❌ Это не Telegram webhook (нет update_id)")
            return jsonify({"status": "error", "message": "Not a Telegram webhook"}), 400
        
        # Передаем данные в обработчик бота
        if hasattr(app, 'telegram_app'):
            print("✅ Передаем данные в telegram_app")
            
            # Создаем Update объект
            update = Update.de_json(data, app.telegram_app.bot)
            print(f"📋 Update создан: {update}")
            print(f"📋 Update ID: {update.update_id}")
            
            if update.message:
                print(f"📋 Сообщение: {update.message.text if update.message.text else 'Нет текста'}")
                print(f"📋 От пользователя: {update.message.from_user.id}")
                print(f"📋 web_app_data: {getattr(update.message, 'web_app_data', 'НЕТ')}")
            elif update.callback_query:
                print(f"📋 Callback query: {update.callback_query.data}")
                print(f"📋 От пользователя: {update.callback_query.from_user.id}")
            
            # Запускаем обработку в отдельном потоке
            import threading
            def process_update_async():
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    print("🔄 Запускаем process_update...")
                    loop.run_until_complete(app.telegram_app.process_update(update))
                    print("✅ Данные обработаны асинхронно")
                except Exception as e:
                    print(f"❌ Ошибка асинхронной обработки: {e}")
                    import traceback
                    print(f"📋 Traceback: {traceback.format_exc()}")
                finally:
                    loop.close()
            
            # Запускаем в отдельном потоке
            thread = threading.Thread(target=process_update_async)
            thread.start()
            print("✅ Поток обработки запущен")
            
        else:
            print("❌ telegram_app не найден")
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"❌ Ошибка обработки webhook: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        logging.error(f"Ошибка обработки webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# API endpoint для создания платежа
@app.route('/api/create-payment', methods=['POST'])
def create_payment_api():
    """API endpoint для создания платежа от Mini Apps"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН API ЗАПРОС НА СОЗДАНИЕ ПЛАТЕЖА!")
        print("=" * 50)
        
        data = request.get_json()
        print(f"📋 Полученные данные: {data}")
        
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Извлекаем данные
        user_id = data.get('user_id') or data.get('userId')
        email = data.get('email')
        tariff = data.get('tariff')
        price = data.get('price')
        
        if not all([user_id, email, tariff, price]):
            return jsonify({
                "status": "error", 
                "message": "Missing required fields",
                "received_data": data
            }), 400
        
        print(f"📋 Создаем платеж: user_id={user_id}, email={email}, tariff={tariff}, price={price}")
        
        # Создаем инвойс через Lava Top API
        payment_url = create_lava_invoice(user_id, email, tariff, price)
        
        if payment_url:
            print(f"✅ Платеж создан успешно: {payment_url}")
            return jsonify({
                "status": "success",
                "payment_url": payment_url,
                "message": "Payment created successfully",
                "data": {
                    "user_id": user_id,
                    "email": email,
                    "tariff": tariff,
                    "price": price,
                    "order_id": f"order_{user_id}_{int(datetime.now().timestamp())}"
                }
            })
        else:
            print("❌ Не удалось создать платеж")
            return jsonify({
                "status": "error",
                "message": "Failed to create payment"
            }), 500
            
    except Exception as e:
        print(f"❌ Ошибка создания платежа: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Webhook endpoint для Lava Top
@app.route('/lava-webhook', methods=['GET', 'POST'])
def lava_webhook():
    """Обрабатывает webhook от Lava Top"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН WEBHOOK ОТ LAVA TOP!")
        print("=" * 50)
        print(f"📋 Method: {request.method}")
        print(f"📋 URL: {request.url}")
        print(f"📋 Headers: {dict(request.headers)}")
        
        # Получаем данные в зависимости от метода
        if request.method == 'GET':
            print("🔍 GET запрос - получаем данные из query параметров")
            data = request.args.to_dict()
        elif request.method == 'POST':
            print("🔍 POST запрос - получаем данные из body")
            data = request.get_json()
            if not data:
                data = request.form.to_dict()
        else:
            return jsonify({"status": "error", "message": "Method not allowed"}), 405
        
        print(f"📋 Полученные данные: {data}")
        
        # Проверяем статус платежа
        payment_status = data.get('status')
        order_id = data.get('order_id')
        amount = data.get('amount')
        currency = data.get('currency')
        metadata = data.get('metadata', {})
        
        # Если metadata это строка, пробуем распарсить JSON
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except:
                metadata = {}
        
        print(f"📋 Metadata: {metadata}")
        
        if payment_status == 'success':
            print("✅ Платеж успешен!")
            
            # Извлекаем данные из metadata
            user_id = metadata.get('user_id') or metadata.get('telegram_id')
            email = metadata.get('email')
            tariff = metadata.get('tariff')
            
            print(f"📋 Извлеченные данные: user_id={user_id}, email={email}, tariff={tariff}")
            
            # Отправляем уведомление только в Telegram
            if user_id:
                try:
                    user_id = int(user_id)
                    print(f"📱 Отправляем сообщение в Telegram пользователю {user_id}")
                    
                    # Создаем подписку в базе данных
                    subscription_id = create_subscription(user_id, email, tariff, amount, currency, order_id, metadata)
                    
                    # Отправляем сообщение пользователю
                    success_message = f"""
💳 <b>Оплата прошла успешно!</b>

✅ Ваша подписка активирована
📧 Email: {email}
💳 Тариф: {tariff}
💰 Сумма: {amount} {currency}
🆔 ID подписки: {subscription_id}

🔗 <a href="https://t.me/+6SQb4RwwAmZlMWQ6">Присоединиться к каналу</a>
                    """
                    
                    keyboard = [[InlineKeyboardButton("🔗 Присоединиться к каналу", url="https://t.me/+6SQb4RwwAmZlMWQ6")]]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                    
                    bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
                    send_message_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    message_data = {
                        "chat_id": user_id,
                        "text": success_message,
                        "parse_mode": "HTML",
                        "reply_markup": reply_markup.to_dict()
                    }
                    
                    response = requests.post(send_message_url, json=message_data)
                    if response.status_code == 200:
                        print("✅ Сообщение отправлено в Telegram")
                    else:
                        print(f"❌ Ошибка отправки в Telegram: {response.text}")
                        
                except Exception as e:
                    print(f"❌ Ошибка обработки пользователя: {e}")
            else:
                print("❌ user_id не найден в metadata")
            
            print("✅ Платеж обработан успешно")
        else:
            print(f"❌ Платеж не прошел: {payment_status}")
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"❌ Ошибка обработки Lava Top webhook: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', '')
WEBHOOK_PATH = '/webhook'

# Администраторы
ADMIN_IDS = [708907063, 7365307696]

# Supabase конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://uhhsrtmmuwoxsdquimaa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Lava Top конфигурация
LAVA_SHOP_ID = os.getenv('LAVA_SHOP_ID', '1b9f3e05-86aa-4102-9648-268f0f586bb1')
LAVA_SECRET_KEY = os.getenv('LAVA_SECRET_KEY', 'whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav')
LAVA_PRODUCT_ID = os.getenv('LAVA_PRODUCT_ID', 'e3dc5b9b-d511-4b79-9457-edfb404a5cc5')
LAVA_PRODUCT_URL_ID = os.getenv('LAVA_PRODUCT_URL_ID', 'dcaf4bee-db84-476f-85a9-f5af24eb648e')

def create_subscription(user_id, email, tariff, amount, currency, order_id, metadata):
    """Создает подписку в базе данных"""
    try:
        # Определяем длительность подписки
        tariff_durations = {
            '1month': 30,
            '1_month': 30,
            '3months': 90,
            '6months': 180,
            '12months': 365
        }
        
        duration_days = tariff_durations.get(tariff, 30)
        end_date = datetime.utcnow() + timedelta(days=duration_days)
        
        subscription_data = {
            'user_id': str(user_id),
            'email': email,
            'tariff': tariff,
            'amount': amount,
            'currency': currency,
            'order_id': order_id,
            'start_date': datetime.utcnow().isoformat(),
            'end_date': end_date.isoformat(),
            'status': 'active',
            'metadata': metadata
        }
        
        print(f"📊 Создаем подписку: {subscription_data}")
        
        result = supabase.table('subscriptions').insert(subscription_data).execute()
        print(f"✅ Подписка создана: {result}")
        
        return result.data[0]['id'] if result.data else 'unknown'
        
    except Exception as e:
        print(f"❌ Ошибка создания подписки: {e}")
        return 'error'

def create_lava_invoice(user_id, email, tariff, price):
    """Создает прямую ссылку на оплату Lava Top"""
    try:
        print("=" * 50)
        print(f"🔧 СОЗДАНИЕ ИНВОЙСА ДЛЯ ПОЛЬЗОВАТЕЛЯ {user_id}")
        print("=" * 50)
        print(f"📋 Email: {email}")
        print(f"📋 Тариф: {tariff}")
        print(f"📋 Цена: {price}₽")
        print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
        print(f"🔑 LAVA_PRODUCT_ID: {LAVA_PRODUCT_ID}")
        
        # Создаем уникальный order_id
        order_id = f"order_{user_id}_{int(datetime.now().timestamp())}"
        print(f"📋 Order ID: {order_id}")
        
        # Создаем metadata с дополнительной информацией
        metadata = {
            'user_id': str(user_id),
            'email': email,
            'tariff': tariff,
            'timestamp': int(datetime.now().timestamp()),
            'bot_name': 'Formula Private Bot'
        }
        
        # Создаем прямую ссылку на оплату
        payment_url = f"https://app.lava.top/ru/products/{LAVA_SHOP_ID}/{LAVA_PRODUCT_ID}?currency=RUB&amount={int(price * 100)}&order_id={order_id}&metadata={json.dumps(metadata)}"
        
        print(f"✅ Создана прямая ссылка на оплату:")
        print(f"🔗 {payment_url}")
        print("=" * 50)
        
        return payment_url
            
    except Exception as e:
        print(f"❌ Ошибка создания инвойса: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        print("=" * 50)
        return None

# Команды бота
async def start(update: Update, context: CallbackContext):
    """Обработчик команды /start"""
    user = update.effective_user
    print(f"🚀 Команда /start от пользователя {user.id}")
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

Добро пожаловать в бот для подписки на закрытый канал.

💡 <b>Что вы получите:</b>
• Эксклюзивный контент
• Доступ к закрытому сообществу
• Регулярные обновления

💳 <b>Стоимость:</b> 50₽ в месяц
    """
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить подписку", callback_data="payment_menu")],
        [InlineKeyboardButton("ℹ️ Подробнее", callback_data="more_info")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_text, parse_mode='HTML', reply_markup=reply_markup)

async def payment_menu(update: Update, context: CallbackContext):
    """Показывает меню оплаты"""
    text = """
💳 <b>Подписка на закрытый канал:</b>

• 1 месяц - 50₽

Получите доступ к эксклюзивному контенту и сообществу.
    """
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить 50₽", callback_data="lava_payment")],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(text, parse_mode='HTML', reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, parse_mode='HTML', reply_markup=reply_markup)

async def handle_lava_payment(update: Update, context: CallbackContext):
    """Обрабатывает нажатие кнопки оплаты"""
    query = update.callback_query
    user = query.from_user
    
    print(f"💳 Пользователь {user.id} нажал кнопку оплаты")
    
    # Создаем инвойс через Lava Top API
    payment_url = create_lava_invoice(user.id, "user@example.com", "1_month", 50)
    
    if payment_url:
        # Отправляем сообщение с кнопкой оплаты
        keyboard = [[InlineKeyboardButton("💳 Оплатить", url=payment_url)]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            f"💳 <b>Оплата подписки</b>\n\n"
            f"✅ Платежная ссылка создана!\n"
            f"💰 Сумма: 50₽\n"
            f"💳 Тариф: 1 месяц\n\n"
            f"Нажмите кнопку ниже для перехода к оплате:",
            parse_mode='HTML',
            reply_markup=reply_markup
        )
        print("✅ Сообщение с кнопкой оплаты отправлено")
    else:
        await query.edit_message_text(
            "❌ Произошла ошибка при создании платежа. Попробуйте еще раз или обратитесь в поддержку."
        )

async def handle_web_app_data(update: Update, context: CallbackContext):
    """Обрабатывает данные от Mini Apps"""
    print("=" * 50)
    print("🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!")
    print("=" * 50)
    
    user = update.effective_user
    message = update.message
    
    print(f"👤 Пользователь: {user.id} (@{user.username})")
    print(f"📱 Тип сообщения: {type(message)}")
    print(f"📱 Есть web_app_data: {hasattr(message, 'web_app_data')}")
    
    if hasattr(message, 'web_app_data') and message.web_app_data:
        print(f"📱 web_app_data объект: {message.web_app_data}")
        print(f"📱 web_app_data.data: {message.web_app_data.data}")
        
        try:
            # Парсим данные от Mini Apps
            web_app_data = message.web_app_data.data
            print(f"📱 Получены данные от Mini Apps: {web_app_data}")
            
            # Парсим JSON данные
            payment_data = json.loads(web_app_data)
            print(f"📋 Парсированные данные: {payment_data}")
            
            # Обрабатываем данные
            await process_payment_data(update, context, payment_data)
            
        except Exception as e:
            print(f"❌ Ошибка обработки web_app_data: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            await message.reply_text("❌ Ошибка обработки данных от Mini Apps")
    else:
        print("❌ web_app_data не найден или пустой")
        await message.reply_text("❌ Данные Mini Apps не получены")

async def handle_all_messages(update: Update, context: CallbackContext):
    """Обрабатывает все сообщения от пользователей"""
    print("=" * 30)
    print("📨 ВЫЗВАНА ФУНКЦИЯ handle_all_messages!")
    print("=" * 30)
    
    user = update.effective_user
    message = update.message
    
    print(f"📨 Получено сообщение от пользователя {user.id}")
    print(f"📋 Тип сообщения: {type(message)}")
    print(f"📋 Содержимое сообщения: {message.text if hasattr(message, 'text') else 'Нет текста'}")
    print(f"📋 web_app_data: {getattr(message, 'web_app_data', 'НЕТ')}")
    
    # Проверяем, является ли это данными от Mini Apps
    if hasattr(message, 'web_app_data') and message.web_app_data:
        print(f"📱 Обнаружены данные от Mini Apps")
        await handle_web_app_data(update, context)
        return
    
    # Проверяем, является ли это JSON данными в тексте
    if message.text:
        try:
            data = json.loads(message.text)
            if isinstance(data, dict) and 'step' in data:
                print(f"📱 Обнаружены JSON данные в тексте: {data}")
                await process_payment_data(update, context, data)
                return
        except:
            pass
    
    # Обычное сообщение
    await message.reply_text(
        "👋 Используйте команду /start для начала работы с ботом!"
    )

async def process_payment_data(update: Update, context: CallbackContext, payment_data: dict):
    """Обрабатывает данные платежа от Mini Apps"""
    user = update.effective_user
    message = update.message
    
    try:
        print(f"📱 Обрабатываем данные платежа: {payment_data}")
        
        # Проверяем тип данных (пошаговая отправка)
        step = payment_data.get('step')
        print(f"📋 Шаг данных: {step}")
        
        if step == 'test_connection':
            print("✅ Тестовое соединение получено!")
            await message.reply_text("✅ Соединение с ботом установлено!")
            return
            
        elif step == 'email_data':
            email = payment_data.get('email')
            print(f"📧 Получен email: {email}")
            await message.reply_text(f"📧 Email получен: {email}")
            return
            
        elif step == 'tariff_data':
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            print(f"💳 Получен tariff: {tariff}, цена: {price}")
            await message.reply_text(f"💳 Tariff получен: {tariff}, цена: {price}₽")
            return
            
        elif step == 'payment_method_data':
            payment_method = payment_data.get('paymentMethod')
            bank = payment_data.get('bank')
            bank_name = payment_data.get('bankName', 'Банк РФ')
            print(f"🏦 Получен payment method: {payment_method}, банк: {bank_name}")
            await message.reply_text(f"🏦 Payment method получен: {payment_method}, банк: {bank_name}")
            return
            
        elif step == 'user_id_data':
            user_id = payment_data.get('userId')
            print(f"👤 Получен user ID: {user_id}")
            await message.reply_text(f"👤 User ID получен: {user_id}")
            return
            
        elif step == 'final_data':
            # Обрабатываем финальные данные
            email = payment_data.get('email')
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            user_id = payment_data.get('userId')
            print(f"🎯 Обрабатываем финальные данные: email={email}, tariff={tariff}, price={price}, user_id={user_id}")
            
            # Проверяем, что все данные есть
            if not email or not tariff or not price:
                print("❌ Не все данные получены:")
                print(f"   email: {email}")
                print(f"   tariff: {tariff}")
                print(f"   price: {price}")
                await message.reply_text("❌ Не все данные получены. Попробуйте еще раз.")
                return
            
            print("✅ Все данные получены, создаем инвойс...")
            
            # Создаем инвойс через Lava Top API
            payment_url = create_lava_invoice(user.id, email, tariff, price)
            
            if payment_url:
                print(f"✅ Инвойс создан успешно: {payment_url}")
                
                # Отправляем сообщение с кнопкой оплаты
                keyboard = [[InlineKeyboardButton("💳 Оплатить", url=payment_url)]]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await message.reply_text(
                    f"💳 <b>Оплата подписки</b>\n\n"
                    f"✅ Ваши данные получены:\n"
                    f"📧 Email: {email}\n"
                    f"💳 Тариф: {tariff}\n"
                    f"💰 Сумма: {price}₽\n\n"
                    f"Нажмите кнопку ниже для перехода к оплате:",
                    parse_mode='HTML',
                    reply_markup=reply_markup
                )
                print("✅ Сообщение с кнопкой оплаты отправлено")
                return
            else:
                print(f"❌ Не удалось создать инвойс")
                await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
                return
        else:
            print(f"❌ Неизвестный шаг: {step}")
            await message.reply_text("❌ Неизвестный тип данных")
            return
            
    except Exception as e:
        print(f"❌ Ошибка обработки данных платежа: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        await message.reply_text("❌ Произошла ошибка при обработке данных")

async def button(update: Update, context: CallbackContext):
    """Обработчик нажатий на кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "payment_menu":
        await payment_menu(update, context)
    elif query.data == "lava_payment":
        await handle_lava_payment(update, context)
    elif query.data == "back_to_start":
        await start(update, context)

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с webhook...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
    print(f"🔑 LAVA_SECRET_KEY: {LAVA_SECRET_KEY[:20]}...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.telegram_app = application # Привязываем приложение к Flask
    
    print("📝 Регистрация обработчиков...")
    
    # Обработчик для web_app_data должен быть первым
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    
    # Регистрируем обработчики кнопок и сообщений
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    
    print("✅ Обработчики зарегистрированы")
    
    # Настраиваем webhook URL для Railway
    webhook_url = os.getenv('RAILWAY_STATIC_URL', '')
    if webhook_url:
        # Убеждаемся, что URL начинается с https://
        if not webhook_url.startswith('http'):
            webhook_url = f"https://{webhook_url}"
        
        print(f"🌐 Настройка webhook: {webhook_url}/webhook")
        
        try:
            # Сначала удаляем старый webhook
            delete_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
            delete_response = requests.post(delete_webhook_url)
            print(f"🗑️ Удаление старого webhook: {delete_response.status_code} - {delete_response.text}")
            
            # Ждем немного
            import time
            time.sleep(2)
            
            # Устанавливаем новый webhook
            webhook_setup_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
            webhook_data = {
                "url": f"{webhook_url}/webhook",
                "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c'),
                "max_connections": 40,
                "allowed_updates": ["message", "callback_query"]
            }
            
            print(f"🔧 Webhook данные: {webhook_data}")
            
            response = requests.post(webhook_setup_url, json=webhook_data)
            print(f"📡 Ответ установки webhook: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
                
                # Проверяем текущий webhook
                get_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
                webhook_info = requests.get(get_webhook_url)
                webhook_result = webhook_info.json()
                print(f"📋 Информация о webhook: {webhook_result}")
                
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
    else:
        print("⚠️ RAILWAY_STATIC_URL не установлен")
    
    print("🚀 Запуск Flask приложения...")
    # Запускаем Flask приложение
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
