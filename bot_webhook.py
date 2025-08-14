#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment
"""

import os
import logging
import requests
import json
import base64
import asyncio
import aiohttp
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from supabase import create_client, Client

# Email отправка отключена - используем только Telegram
def send_email_invitation(email, tariff, subscription_id):
    print(f"📧 Email отправка отключена: {email}, тариф: {tariff}")
    return True

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

# LAVA TOP (seller API) конфигурация
LAVA_TOP_API_BASE = os.getenv('LAVA_TOP_API_BASE', 'https://gate.lava.top')
LAVA_TOP_API_KEY = os.getenv('LAVA_TOP_API_KEY', 'whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav')
LAVA_OFFER_ID_BASIC = os.getenv('LAVA_OFFER_ID_BASIC', '302ecdcd-1581-45ad-8353-a168f347b8cc')
LAVA_TOP_WEBHOOK_SECRET = os.getenv('LAVA_TOP_WEBHOOK_SECRET', '')

# Telegram конфигурация
PUBLIC_BASE_URL = os.getenv('PUBLIC_BASE_URL', 'https://formulaprivate-productionpaymentuknow.up.railway.app')
PRIVATE_CHANNEL_ID = os.getenv('PRIVATE_CHANNEL_ID', '-1001234567890')
ADMIN_IDS = [int(x.strip()) for x in os.getenv('ADMIN_IDS', '708907063,7365307696').split(',') if x.strip()]

# MiniApp
PAYMENT_MINIAPP_URL = os.getenv('PAYMENT_MINIAPP_URL', 'https://acqu1red.github.io/formulaprivate/')

# Создаем Flask приложение для health check
app = Flask(__name__)

# Health check endpoint для Railway
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "telegram-bot-webhook"})



# Webhook endpoint для Telegram
@app.route('/webhook', methods=['GET', 'POST'])
def telegram_webhook():
    """Обрабатывает webhook от Telegram"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН WEBHOOK ОТ TELEGRAM!")
        print("=" * 50)
        print(f"📋 Headers: {dict(request.headers)}")
        print(f"📋 Method: {request.method}")
        print(f"📋 URL: {request.url}")
        print(f"📋 Content-Type: {request.headers.get('Content-Type')}")
        print(f"📋 User-Agent: {request.headers.get('User-Agent')}")
        
        # Обрабатываем GET запросы (проверка доступности)
        if request.method == 'GET':
            print("✅ GET запрос - проверка доступности webhook")
            
            # Проверяем и исправляем webhook при GET запросе
            try:
                webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
                response = requests.get(webhook_url)
                webhook_data = response.json()
                
                current_url = webhook_data.get('result', {}).get('url', '')
                expected_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
                
                if current_url != expected_url:
                    print(f"⚠️ Webhook неправильный: {current_url} != {expected_url}")
                    print("🔧 Автоматически исправляем webhook...")
                    
                    # Удаляем старый webhook
                    delete_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
                    requests.post(delete_url)
                    
                    import time
                    time.sleep(2)
                    
                    # Устанавливаем новый webhook
                    set_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
                    webhook_data_setup = {
                        "url": expected_url,
                        "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c'),
                        "max_connections": 40,
                        "allowed_updates": ["message", "callback_query"]
                    }
                    
                    set_response = requests.post(set_url, json=webhook_data_setup)
                    print(f"🔧 Webhook исправлен: {set_response.status_code}")
                    
            except Exception as e:
                print(f"⚠️ Ошибка проверки webhook: {e}")
            
            return jsonify({
                "status": "ok", 
                "message": "Telegram webhook endpoint доступен",
                "method": "GET",
                "timestamp": datetime.now().isoformat()
            })
        
        # Получаем данные от Telegram (только для POST)
        print("📥 Обрабатываем POST запрос от Telegram")
        data = request.get_json()
        print(f"📋 Данные от Telegram: {data}")
        print(f"📋 Размер данных: {len(str(data)) if data else 0} символов")
        print(f"📋 Content-Length: {request.headers.get('Content-Length')}")
        
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
            print(f"📋 Тип Update: {type(update)}")
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

# Endpoint для создания инвойса
@app.route('/create-invoice', methods=['POST'])
def create_invoice():
    """Создает инвойс через Lava Top API"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН ЗАПРОС НА СОЗДАНИЕ ИНВОЙСА!")
        print("=" * 50)
        
        data = request.get_json()
        print(f"📋 Полученные данные: {data}")
        
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Извлекаем данные
        user_id = data.get('user_id')
        email = data.get('email')
        tariff = data.get('tariff')
        price = data.get('price')
        
        if not all([user_id, email, tariff, price]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400
        
        print(f"📋 Создаем инвойс: user_id={user_id}, email={email}, tariff={tariff}, price={price}")
        
        # Создаем инвойс через Lava Top API
        payment_url = create_lava_invoice(user_id, email, tariff, price)
        
        if payment_url:
            return jsonify({
                "status": "success",
                "payment_url": payment_url,
                "message": "Invoice created successfully"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to create invoice"
            }), 500
            
    except Exception as e:
        print(f"❌ Ошибка создания инвойса: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Endpoint для создания инвойса через Mini Apps
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
            return jsonify({"ok": False, "error": "No data provided"}), 400
        
        # Извлекаем данные
        user_id = data.get('user_id') or data.get('userId')
        email = data.get('email')
        tariff = data.get('tariff')
        price = data.get('price')
        bank = data.get('bank', 'russian')
        
        if not all([user_id, email, tariff, price]):
            return jsonify({
                "ok": False, 
                "error": "Missing required fields",
                "received_data": data
            }), 400
        
        print(f"📋 Создаем платеж: user_id={user_id}, email={email}, tariff={tariff}, price={price}")
        
        # Создаем инвойс через Lava Top Seller API
        payment_url = create_lava_invoice(user_id, email, tariff, price)
        
        if payment_url:
            print(f"✅ Платеж создан успешно: {payment_url}")
            return jsonify({
                "ok": True,
                "payment_url": payment_url,
                "message": "Payment created successfully"
            })
        else:
            print("❌ Не удалось создать платеж")
            return jsonify({
                "ok": False,
                "error": "Failed to create payment"
            }), 500
            
    except Exception as e:
        print(f"❌ Ошибка создания платежа: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"ok": False, "error": str(e)}), 500

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
        
        # Проверка подписи вебхука (если включена)
        if LAVA_TOP_WEBHOOK_SECRET:
            signature = request.headers.get('X-Signature')
            if signature:
                # Здесь можно добавить проверку HMAC подписи
                print(f"🔍 Проверка подписи: {signature}")
        
        # Получаем данные
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
        
        # Проверяем статус платежа (seller API формат)
        payment_status = data.get('status') or data.get('state')
        order_id = data.get('order_id') or data.get('id')
        amount = data.get('amount')
        currency = data.get('currency')
        email = data.get('email')
        
        print(f"📋 Статус платежа: {payment_status}")
        
        # Обрабатываем успешный платеж
        if payment_status in ['success', 'paid', 'completed']:
            print("✅ Платеж успешен!")
            
            # Определяем пользователя по email из вебхука
            # Ищем пользователя в базе данных по email
            user_id = None
            
            if email:
                try:
                    # Ищем пользователя в базе данных по email
                    result = supabase.table('bot_users').select('telegram_id').eq('email', email).execute()
                    if result.data:
                        user_id = result.data[0]['telegram_id']
                        print(f"✅ Найден пользователь по email {email}: {user_id}")
                    else:
                        print(f"❌ Пользователь с email {email} не найден в базе")
                except Exception as e:
                    print(f"❌ Ошибка поиска пользователя по email: {e}")
                    # Если таблица bot_users не существует или колонка email отсутствует
                    if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                        print("⚠️ Таблица 'bot_users' не существует. Создайте таблицу bot_users в Supabase")
                    elif "column" in str(e).lower() and "does not exist" in str(e).lower():
                        print("⚠️ Колонка 'email' не существует в таблице bot_users. Проверьте структуру таблицы")
                    else:
                        print(f"⚠️ Неизвестная ошибка базы данных: {e}")
            
            if user_id:
                try:
                    print(f"📱 Отправляем инвайт пользователю {user_id}")
                    
                    # Создаем одноразовую инвайт-ссылку
                    bot_token = TELEGRAM_BOT_TOKEN
                    invite_url = f"https://api.telegram.org/bot{bot_token}/createChatInviteLink"
                    invite_data = {
                        "chat_id": PRIVATE_CHANNEL_ID,
                        "member_limit": 1,
                        "creates_join_request": False
                    }
                    
                    invite_response = requests.post(invite_url, json=invite_data)
                    if invite_response.status_code == 200:
                        invite_result = invite_response.json()
                        invite_link = invite_result['result']['invite_link']
                        
                        # Отправляем сообщение с инвайтом
                        message_text = f"🎉 Оплата прошла!\n\n🔗 Ваша ссылка для входа в закрытый канал:\n{invite_link}"
                        
                        send_message_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                        message_data = {
                            "chat_id": user_id,
                            "text": message_text,
                            "parse_mode": "HTML"
                        }
                        
                        response = requests.post(send_message_url, json=message_data)
                        if response.status_code == 200:
                            print("✅ Инвайт отправлен пользователю")
                        else:
                            print(f"❌ Ошибка отправки инвайта: {response.text}")
                    else:
                        print(f"❌ Ошибка создания инвайт-ссылки: {invite_response.text}")
                        
                except Exception as e:
                    print(f"❌ Ошибка обработки пользователя: {e}")
            else:
                print("❌ user_id не найден")
                # Отправляем уведомление администраторам
                for admin_id in ADMIN_IDS:
                    try:
                        message_text = f"⚠️ Платеж прошел, но пользователь не найден!\n\n📧 Email: {email}\n💰 Сумма: {amount} {currency}\n🆔 Order ID: {order_id}"
                        
                        send_message_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                        message_data = {
                            "chat_id": admin_id,
                            "text": message_text,
                            "parse_mode": "HTML"
                        }
                        
                        response = requests.post(send_message_url, json=message_data)
                        if response.status_code == 200:
                            print(f"✅ Уведомление отправлено администратору {admin_id}")
                        else:
                            print(f"❌ Ошибка отправки уведомления администратору {admin_id}: {response.text}")
                    except Exception as e:
                        print(f"❌ Ошибка отправки уведомления администратору {admin_id}: {e}")
            
            print("✅ Платеж обработан успешно")
        else:
            print(f"❌ Платеж не прошел: {payment_status}")
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"❌ Ошибка обработки Lava Top webhook: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"status": "error", "message": str(e)}), 500

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

# LAVA TOP Seller API функции
OFFER_MAP = {
    "basic": LAVA_OFFER_ID_BASIC,
    "1_month": LAVA_OFFER_ID_BASIC,  # Алиас для совместимости
}

def _method_by(bank: str, currency: str = "RUB") -> str:
    bank = (bank or "russian").lower()
    currency = (currency or "RUB").upper()
    if currency == "RUB":
        return "BANK131"
    return "UNLIMINT"  # на будущее (USD/EUR), не ломать текущую логику

async def create_lava_top_invoice(*, email: str, tariff: str, price: int, bank: str, user_id: str = None, currency: str = "RUB") -> str:
    print(f"🔍 Проверка LAVA_TOP_API_KEY: {'УСТАНОВЛЕН' if LAVA_TOP_API_KEY else 'НЕ УСТАНОВЛЕН'}")
    if LAVA_TOP_API_KEY:
        print(f"🔍 Префикс ключа: {LAVA_TOP_API_KEY[:10]}...")
    else:
        raise RuntimeError("LAVA_TOP_API_KEY не установлен. Установите переменную окружения LAVA_TOP_API_KEY в Railway")
    
    # Нормализуем tariff к basic
    tariff_normalized = (tariff or "basic").lower()
    if tariff_normalized not in ["basic", "1_month"]:
        tariff_normalized = "basic"
    
    offer_id = OFFER_MAP.get(tariff_normalized)
    if not offer_id:
        raise RuntimeError(f"No offerId for tariff={tariff}")

    # Сохраняем пользователя в базе данных для последующего поиска по email
    if user_id and email:
        try:
            # Проверяем, существует ли пользователь
            existing_user = supabase.table('bot_users').select('id').eq('telegram_id', user_id).execute()
            if not existing_user.data:
                # Создаем нового пользователя
                user_data = {
                    'telegram_id': user_id,
                    'email': email,
                    'created_at': datetime.utcnow().isoformat()
                }
                supabase.table('bot_users').insert(user_data).execute()
                print(f"✅ Пользователь {user_id} сохранен в базе с email {email}")
            else:
                # Обновляем email пользователя
                supabase.table('bot_users').update({'email': email}).eq('telegram_id', user_id).execute()
                print(f"✅ Email пользователя {user_id} обновлен: {email}")
        except Exception as e:
            print(f"⚠️ Ошибка сохранения пользователя: {e}")
            # Если таблица bot_users не существует или колонка email отсутствует
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("⚠️ Таблица 'bot_users' не существует. Создайте таблицу bot_users в Supabase")
            elif "column" in str(e).lower() and "does not exist" in str(e).lower():
                print("⚠️ Колонка 'email' не существует в таблице bot_users. Проверьте структуру таблицы")
            else:
                print(f"⚠️ Неизвестная ошибка базы данных: {e}")

    url = f"{LAVA_TOP_API_BASE.rstrip('/')}/api/v2/invoice"
    headers = {
        "X-Api-Key": LAVA_TOP_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "email": email,
        "offerId": offer_id,
        "currency": currency,
        "paymentMethod": _method_by(bank, currency),
        "buyerLanguage": "RU"
    }
    
    print(f"🔧 Создаем инвойс LAVA TOP:")
    print(f"   URL: {url}")
    print(f"   Offer ID: {offer_id}")
    print(f"   Payload: {payload}")
    
    async with aiohttp.ClientSession() as s:
        async with s.post(url, headers=headers, json=payload) as r:
            txt = await r.text()
            print(f"📡 LAVA TOP ответ: {r.status} - {txt}")
            
            if r.status != 200:
                raise RuntimeError(f"Lava TOP {r.status}: {txt}")
            
            data = json.loads(txt)
            pay_url = next((data.get(k) for k in ("payUrl","invoiceUrl","paymentUrl","url","link") if data.get(k)), None)
            if not pay_url:
                raise RuntimeError(f"No payment URL in response: {data}")
            return pay_url

def create_lava_invoice(user_id, email, tariff, price):
    """Создает инвойс через Lava Top API (синхронная версия)"""
    try:
        print(f"🔧 Создаем инвойс для пользователя {user_id}")
        print(f"📋 Данные: email={email}, tariff={tariff}, price={price}")
        
        # Нормализуем tariff к basic
        tariff_normalized = (tariff or "basic").lower()
        if tariff_normalized not in ["basic", "1_month"]:
            tariff_normalized = "basic"
        
        # Используем асинхронную функцию в синхронном контексте
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            payment_url = loop.run_until_complete(
                create_lava_top_invoice(
                    email=email, 
                    tariff=tariff_normalized, 
                    price=price, 
                    bank="russian",
                    user_id=str(user_id)
                )
            )
            print(f"✅ Создана ссылка на оплату: {payment_url}")
            return payment_url
        finally:
            loop.close()
            
    except Exception as e:
        print(f"❌ Ошибка создания инвойса: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return None

async def create_lava_invoice_async(user_id, email, tariff, price):
    """Создает инвойс через Lava Top API (асинхронная версия)"""
    try:
        print(f"🔧 Создаем инвойс для пользователя {user_id}")
        print(f"📋 Данные: email={email}, tariff={tariff}, price={price}")
        
        # Нормализуем tariff к basic
        tariff_normalized = (tariff or "basic").lower()
        if tariff_normalized not in ["basic", "1_month"]:
            tariff_normalized = "basic"
        
        # Используем новую функцию seller API
        payment_url = await create_lava_top_invoice(
            email=email, 
            tariff=tariff_normalized, 
            price=price, 
            bank="russian",
            user_id=str(user_id)
        )
        
        print(f"✅ Создана ссылка на оплату: {payment_url}")
        return payment_url
        
    except Exception as e:
        print(f"❌ Ошибка создания инвойса: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return None

# Команды бота
async def start(update: Update, context: CallbackContext):
    """Обработчик команды /start"""
    user = update.effective_user
    print(f"🚀 Команда /start от пользователя {user.id}")
    print(f"📋 Пользователь: {user.first_name} {user.last_name or ''} (@{user.username or 'без username'})")
    print(f"📋 ID пользователя: {user.id}")
    
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

async def payment(update: Update, context: CallbackContext):
    """Обработчик команды /payment"""
    await payment_menu(update, context)

async def more_info(update: Update, context: CallbackContext):
    """Обработчик команды /more_info"""
    info_text = """
ℹ️ <b>Подробная информация</b>

📋 <b>Что включено в подписку:</b>
• Доступ к закрытому Telegram каналу
• Эксклюзивный контент
• Общение с единомышленниками
• Регулярные обновления

⏱️ <b>Длительность:</b> 1 месяц
💰 <b>Стоимость:</b> 50₽

🔒 <b>Безопасность:</b>
• Безопасная оплата через Lava Top
• Автоматическое продление
• Возможность отмены в любое время
    """
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить", callback_data="payment_menu")],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(info_text, parse_mode='HTML', reply_markup=reply_markup)

async def payment_menu(update: Update, context: CallbackContext):
    """Показывает меню оплаты"""
    text = """
💳 <b>Подписка на закрытый канал:</b>

• 1 месяц - 50₽

Получите доступ к эксклюзивному контенту и сообществу.
    """
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить через Mini Apps", web_app={"url": "https://acqu1red.github.io/formulaprivate/payment.html"})],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(text, parse_mode='HTML', reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, parse_mode='HTML', reply_markup=reply_markup)



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
    print(f"📱 Все атрибуты сообщения: {dir(message)}")
    
    if hasattr(message, 'web_app_data') and message.web_app_data:
        print(f"📱 web_app_data объект: {message.web_app_data}")
        print(f"📱 web_app_data.data: {message.web_app_data.data}")
        print(f"📱 web_app_data.data тип: {type(message.web_app_data.data)}")
        
        try:
            # Парсим данные от Mini Apps
            web_app_data = message.web_app_data.data
            print(f"📱 Получены данные от Mini Apps: {web_app_data}")
            
            # Пробуем декодировать из base64, если не получится - используем как есть
            try:
                import base64
                decoded_data = base64.b64decode(web_app_data).decode('utf-8')
                print(f"📱 Декодированные данные из base64: {decoded_data}")
                payment_data = json.loads(decoded_data)
            except Exception as decode_error:
                # Если не base64, пробуем парсить как обычный JSON
                print(f"📱 Ошибка декодирования base64: {decode_error}")
                print(f"📱 Парсим как обычный JSON: {web_app_data}")
                payment_data = json.loads(web_app_data)
            
            print(f"📋 Парсированные данные: {payment_data}")
            print(f"📋 Тип данных: {type(payment_data)}")
            
            # Обрабатываем данные
            await process_payment_data(update, context, payment_data)
            
        except Exception as e:
            print(f"❌ Ошибка обработки web_app_data: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            await message.reply_text("❌ Ошибка обработки данных от Mini Apps")
    else:
        print("❌ web_app_data не найден или пустой")
        print(f"📱 Содержимое сообщения: {message}")
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
            if isinstance(data, dict) and ('step' in data or 'email' in data):
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
        
        # Проверяем тип данных (пошаговая отправка или прямой формат)
        step = payment_data.get('step')
        print(f"📋 Шаг данных: {step}")
        
        # Если есть поле step - это пошаговая отправка
        if step:
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
                bank = payment_data.get('bank', 'russian')
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
                
                # Создаем инвойс через LAVA TOP Seller API
                try:
                    payment_url = await create_lava_top_invoice(
                        email=email,
                        tariff=tariff,
                        price=price,
                        bank=bank,
                        user_id=str(user.id)
                    )
                    
                    if payment_url:
                        print(f"✅ Инвойс создан успешно: {payment_url}")
                        
                        # Отправляем сообщение с кнопкой оплаты
                        keyboard = [[InlineKeyboardButton("💳 Перейти к оплате", url=payment_url)]]
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
                        print("❌ Не удалось создать инвойс")
                        await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
                        return
                        
                except Exception as e:
                    print(f"❌ Ошибка создания инвойса: {e}")
                    await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
                    return
        else:
            # Прямой формат данных (без поля step)
            print("📦 Обрабатываем прямой формат данных")
            email = payment_data.get('email')
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            user_id = payment_data.get('userId')
            bank = payment_data.get('bank', 'russian')
            print(f"🎯 Обрабатываем данные: email={email}, tariff={tariff}, price={price}, user_id={user_id}")
            
            # Проверяем, что все данные есть
            if not email or not tariff or not price:
                print("❌ Не все данные получены:")
                print(f"   email: {email}")
                print(f"   tariff: {tariff}")
                print(f"   price: {price}")
                await message.reply_text("❌ Не все данные получены. Попробуйте еще раз.")
                return
            
            print("✅ Все данные получены, создаем инвойс...")
            
            # Создаем инвойс через LAVA TOP Seller API
            try:
                payment_url = await create_lava_top_invoice(
                    email=email,
                    tariff=tariff,
                    price=price,
                    bank=bank,
                    user_id=str(user.id)
                )
                
                if payment_url:
                    print(f"✅ Инвойс создан успешно: {payment_url}")
                    
                    # Отправляем сообщение с кнопкой оплаты
                    keyboard = [[InlineKeyboardButton("💳 Перейти к оплате", url=payment_url)]]
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
                    print("❌ Не удалось создать инвойс")
                    await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
                    return
                    
            except Exception as e:
                print(f"❌ Ошибка создания инвойса: {e}")
                await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
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
    elif query.data == "more_info":
        await more_info(update, context)
    elif query.data == "back_to_start":
        await start(update, context)

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с webhook...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_TOP_API_KEY: {'УСТАНОВЛЕН' if LAVA_TOP_API_KEY else 'НЕ УСТАНОВЛЕН'}")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.telegram_app = application # Привязываем приложение к Flask
    
    print("📝 Регистрация обработчиков...")
    
    # Обработчик для web_app_data должен быть первым
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("payment", payment))
    application.add_handler(CommandHandler("more_info", more_info))
    
    # Регистрируем обработчики кнопок и сообщений
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    
    print("✅ Обработчики зарегистрированы")
    
    # Настраиваем Mini Apps для бота
    try:
        print("🔧 Настройка Mini Apps...")
        # Устанавливаем команды для бота
        commands = [
            ("start", "Запустить бота"),
            ("payment", "Оплатить подписку"),
            ("more_info", "Подробнее")
        ]
        
        set_commands_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setMyCommands"
        commands_data = {"commands": [{"command": cmd[0], "description": cmd[1]} for cmd in commands]}
        
        response = requests.post(set_commands_url, json=commands_data)
        if response.status_code == 200:
            print("✅ Команды бота настроены")
        else:
            print(f"⚠️ Ошибка настройки команд: {response.text}")
            
    except Exception as e:
        print(f"⚠️ Ошибка настройки Mini Apps: {e}")
    
    # Настраиваем webhook URL для Railway
    webhook_url = os.getenv('RAILWAY_STATIC_URL', '')
    if not webhook_url:
        webhook_url = os.getenv('PUBLIC_BASE_URL', '')
    
    # Если мы в Railway, используем стандартный URL
    if not webhook_url and os.getenv('RAILWAY_ENVIRONMENT'):
        webhook_url = 'https://formulaprivate-productionpaymentuknow.up.railway.app'
        print(f"🌐 Обнаружена среда Railway, используем стандартный URL: {webhook_url}")
    
    if webhook_url:
        # Убеждаемся, что URL начинается с https://
        if not webhook_url.startswith('http'):
            webhook_url = f"https://{webhook_url}"
        
        print(f"🌐 Настройка webhook: {webhook_url}/webhook")
        # Устанавливаем webhook URL через requests (синхронно)
        webhook_setup_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
        webhook_data = {
            "url": f"{webhook_url}/webhook",
            "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c')
        }
        
        try:
            # Сначала удаляем старый webhook
            delete_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
            delete_response = requests.post(delete_webhook_url)
            print(f"🗑️ Удаление старого webhook: {delete_response.status_code}")
            
            # Ждем немного
            import time
            time.sleep(2)
            
            # Устанавливаем новый webhook с дополнительными параметрами
            webhook_data_with_params = {
                "url": f"{webhook_url}/webhook",
                "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c'),
                "max_connections": 40,
                "allowed_updates": ["message", "callback_query"]
            }
            
            response = requests.post(webhook_setup_url, json=webhook_data_with_params)
            print(f"📡 Установка webhook: {response.status_code}")
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
    else:
        print("❌ Не удалось настроить webhook URL")
        print("🚀 Запускаем Flask приложение без webhook")
    
    print("🚀 Запуск Flask приложения...")
    # Запускаем Flask приложение
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
