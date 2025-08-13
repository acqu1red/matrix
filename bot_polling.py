#!/usr/bin/env python3
"""
Telegram Bot с Polling для обработки Mini Apps данных
"""

import os
import logging
import requests
import json
from datetime import datetime
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, CallbackContext

# Создаем Flask приложение для health check
app = Flask(__name__)

# Health check endpoint для Railway
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "telegram-bot-polling"})

# Endpoint для payment.html
@app.route('/payment.html', methods=['GET'])
def payment_page():
    """Отдает страницу payment.html"""
    try:
        with open('payment.html', 'r', encoding='utf-8') as f:
            content = f.read()
        return content, 200, {'Content-Type': 'text/html; charset=utf-8'}
    except FileNotFoundError:
        return "Payment page not found", 404
    except Exception as e:
        print(f"❌ Ошибка чтения payment.html: {e}")
        return "Error loading payment page", 500

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
        
        # Проверка API key аутентификации
        api_key_header = request.headers.get('X-API-Key') or request.headers.get('Authorization')
        print(f"🔍 API Key: {api_key_header}")
        
        if api_key_header:
            if api_key_header.startswith('Bearer '):
                api_key_header = api_key_header[7:]
            
            expected_api_key = 'LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z'
            if api_key_header != expected_api_key:
                print(f"❌ Неверный API key")
                return jsonify({"status": "error", "message": "Unauthorized"}), 401
            else:
                print("✅ API key верный")
        else:
            print("⚠️ API key не найден, но продолжаем обработку")
        
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
                    
                    # Отправляем сообщение пользователю
                    success_message = f"""
💳 <b>Оплата прошла успешно!</b>

✅ Ваша подписка активирована
📧 Email: {email}
💳 Тариф: {tariff}
💰 Сумма: {amount} {currency}

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
LAVA_SHOP_ID = os.getenv('LAVA_SHOP_ID', '1b9f3e05-86aa-4102-9648-268f0f586bb1')
LAVA_SECRET_KEY = os.getenv('LAVA_SECRET_KEY', 'whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav')

# Администраторы
ADMIN_IDS = [708907063, 7365307696]

# Supabase конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://uhhsrtmmuwoxsdquimaa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8')

def create_subscription(user_id, email, tariff, amount, currency, order_id, metadata):
    """Создает подписку в базе данных"""
    try:
        # Вычисляем дату окончания подписки
        from datetime import datetime, timedelta
        start_date = datetime.now()
        
        if tariff == '1_month':
            end_date = start_date + timedelta(days=30)
        elif tariff == '6_months':
            end_date = start_date + timedelta(days=180)
        elif tariff == '12_months':
            end_date = start_date + timedelta(days=365)
        else:
            end_date = start_date + timedelta(days=30)  # По умолчанию 1 месяц
        
        # Создаем запись в базе данных
        subscription_data = {
            "user_id": user_id,
            "email": email,
            "tariff": tariff,
            "amount": amount,
            "currency": currency,
            "order_id": order_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active",
            "metadata": json.dumps(metadata) if isinstance(metadata, dict) else str(metadata)
        }
        
        # Отправляем данные в Supabase
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/subscriptions",
            json=subscription_data,
            headers=headers
        )
        
        if response.status_code == 201:
            result = response.json()
            subscription_id = result[0]['id'] if result else 'unknown'
            print(f"✅ Подписка создана с ID: {subscription_id}")
            return subscription_id
        else:
            print(f"❌ Ошибка создания подписки: {response.status_code} - {response.text}")
            return 'error'
            
    except Exception as e:
        print(f"❌ Ошибка создания подписки: {e}")
        return 'error'

async def start(update: Update, context: CallbackContext):
    """Обрабатывает команду /start"""
    user = update.effective_user
    
    welcome_text = f"""
👋 <b>Добро пожаловать!</b>

Я бот для подписки на закрытый канал.

💳 <b>Тарифы:</b>
• 1 месяц - 50₽

🔗 <b>Что включено:</b>
• Доступ к эксклюзивному контенту
• Участие в сообществе
• Персональная поддержка

Нажмите кнопку ниже для оплаты:
    """
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить подписку", callback_data="payment_menu")],
        [InlineKeyboardButton("ℹ️ Подробнее", callback_data="more_info")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_text, parse_mode='HTML', reply_markup=reply_markup)

async def payment(update: Update, context: CallbackContext):
    """Обрабатывает команду /payment"""
    await payment_menu(update, context)

async def more_info(update: Update, context: CallbackContext):
    """Обрабатывает команду /more_info"""
    info_text = """
ℹ️ <b>Подробная информация</b>

📋 <b>Что вы получаете:</b>
• Доступ к закрытому Telegram каналу
• Эксклюзивный контент
• Общение с единомышленниками
• Персональную поддержку

💳 <b>Способы оплаты:</b>
• Банковские карты РФ
• Безопасная оплата через Lava Top

🔒 <b>Безопасность:</b>
• Все платежи защищены
• Данные не передаются третьим лицам
• Мгновенная активация после оплаты

Есть вопросы? Обратитесь к администратору.
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
    
    await query.edit_message_text(
        f"💳 <b>Оплата подписки</b>\n\n"
        f"Для оплаты используйте Mini Apps:\n"
        f"1. Нажмите кнопку '💳 Оплатить' ниже\n"
        f"2. Введите ваш email\n"
        f"3. Подтвердите данные\n"
        f"4. Перейдите к оплате\n\n"
        f"Бот автоматически создаст платежную ссылку с вашими данными.",
        parse_mode='HTML',
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("💳 Оплатить", web_app=WebAppInfo(url="https://formulaprivate-productionpaymentuknow.up.railway.app/payment.html"))],
            [InlineKeyboardButton("🔙 Назад", callback_data="payment_menu")]
        ])
    )

async def handle_web_app_data(update: Update, context: CallbackContext):
    """Обрабатывает данные от Mini Apps"""
    print("=" * 60)
    print("🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APPS!")
    print("=" * 60)
    
    user = update.effective_user
    message = update.message
    
    print(f"👤 Пользователь: {user.id} (@{user.username})")
    print(f"📱 Тип сообщения: {type(message)}")
    print(f"📱 Есть web_app_data: {hasattr(message, 'web_app_data')}")
    
    if hasattr(message, 'web_app_data') and message.web_app_data:
        print(f"📱 web_app_data: {message.web_app_data.data}")
        
        try:
            # Парсим данные от Mini Apps
            payment_data = json.loads(message.web_app_data.data)
            print(f"📋 Парсированные данные: {payment_data}")
            
            # Проверяем тип данных
            step = payment_data.get('step')
            print(f"📋 Шаг данных: {step}")
            
            if step == 'final_data':
                print("🎯 ОБРАБАТЫВАЕМ ФИНАЛЬНЫЕ ДАННЫЕ!")
                
                # Извлекаем данные
                email = payment_data.get('email')
                tariff = payment_data.get('tariff')
                price = payment_data.get('price')
                user_id = payment_data.get('userId')
                
                print(f"📧 Email: {email}")
                print(f"💳 Tariff: {tariff}")
                print(f"💰 Price: {price}")
                print(f"👤 User ID: {user_id}")
                
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
                invoice_data = {
                    "shop_id": LAVA_SHOP_ID,
                    "amount": int(price * 100),  # Конвертируем в копейки
                    "currency": "RUB",
                    "order_id": f"order_{user.id}_{int(datetime.now().timestamp())}",
                    "hook_url": f"https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook",
                    "success_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
                    "fail_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
                    "metadata": {
                        "user_id": str(user.id),
                        "telegram_id": str(user.id),
                        "tariff": tariff,
                        "email": email,
                        "username": user.username if user.username else None,
                        "first_name": user.first_name if user.first_name else None
                    }
                }
                
                print(f"📤 Создаем инвойс с данными: {invoice_data}")
                print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
                print(f"🔑 LAVA_SECRET_KEY: {LAVA_SECRET_KEY[:20]}...")
                print(f"💰 Сумма в копейках: {int(price * 100)}")
                
                # Отправляем запрос к Lava Top API
                api_url = "https://api.lava.top/business/invoice/create"
                headers = {
                    "Authorization": f"Bearer {LAVA_SECRET_KEY}",
                    "Content-Type": "application/json"
                }
                
                print(f"📡 Отправляем запрос к: {api_url}")
                print(f"📡 Headers: {headers}")
                
                response = requests.post(api_url, json=invoice_data, headers=headers)
                print(f"📡 Ответ API: {response.status_code} - {response.text}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"📋 Полный ответ API: {result}")
                    
                    payment_url = result.get('data', {}).get('url')
                    print(f"🔍 Ищем payment_url в: {result.get('data', {})}")
                    
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
                        print(f"❌ URL не найден в ответе: {result}")
                        print(f"📋 Структура ответа: {list(result.keys())}")
                        if 'data' in result:
                            print(f"📋 Структура data: {list(result['data'].keys())}")
                else:
                    print(f"❌ HTTP ошибка: {response.status_code} - {response.text}")
                    print(f"📋 Заголовки ответа: {dict(response.headers)}")
                
                await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
                
            else:
                print(f"📋 Получен шаг: {step}")
                await message.reply_text(f"📋 Получен шаг: {step}")
                
        except Exception as e:
            print(f"❌ Ошибка обработки данных Mini Apps: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            await message.reply_text("❌ Ошибка обработки данных. Попробуйте еще раз.")
    else:
        print("❌ web_app_data не найден")
        await message.reply_text("❌ Данные Mini Apps не получены")

async def handle_web_app_data_from_text(update: Update, context: CallbackContext):
    """Обрабатывает данные от Mini Apps, полученные через обычное сообщение"""
    user = update.effective_user
    message = update.message
    
    try:
        print(f"📱 Обрабатываем данные из текста: {message.text}")
        
        # Парсим JSON данные
        payment_data = json.loads(message.text)
        print(f"📋 Парсированные данные: {payment_data}")
        
        # Проверяем тип данных
        step = payment_data.get('step')
        print(f"📋 Шаг данных из текста: {step}")
        
        if step == 'final_data':
            print("🎯 ОБРАБАТЫВАЕМ ФИНАЛЬНЫЕ ДАННЫЕ ИЗ ТЕКСТА!")
            
            # Извлекаем данные
            email = payment_data.get('email')
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            user_id = payment_data.get('userId')
            
            print(f"📧 Email: {email}")
            print(f"💳 Tariff: {tariff}")
            print(f"💰 Price: {price}")
            print(f"👤 User ID: {user_id}")
            
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
            invoice_data = {
                "shop_id": LAVA_SHOP_ID,
                "amount": int(price * 100),  # Конвертируем в копейки
                "currency": "RUB",
                "order_id": f"order_{user.id}_{int(datetime.now().timestamp())}",
                "hook_url": f"https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook",
                "success_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
                "fail_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
                "metadata": {
                    "user_id": str(user.id),
                    "telegram_id": str(user.id),
                    "tariff": tariff,
                    "email": email,
                    "username": user.username if user.username else None,
                    "first_name": user.first_name if user.first_name else None
                }
            }
            
            print(f"📤 Создаем инвойс с данными: {invoice_data}")
            
            # Отправляем запрос к Lava Top API
            api_url = "https://api.lava.top/business/invoice/create"
            headers = {
                "Authorization": f"Bearer {LAVA_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(api_url, json=invoice_data, headers=headers)
            print(f"📡 Ответ API: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                payment_url = result.get('data', {}).get('url')
                
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
                    return
                else:
                    print(f"❌ URL не найден в ответе: {result}")
            else:
                print(f"❌ HTTP ошибка: {response.status_code} - {response.text}")
            
            await message.reply_text("❌ Ошибка создания платежа. Попробуйте еще раз.")
            
        else:
            print(f"📋 Получен шаг: {step}")
            await message.reply_text(f"📋 Получен шаг: {step}")
            
    except Exception as e:
        print(f"❌ Ошибка обработки данных из текста: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        await message.reply_text("❌ Ошибка обработки данных. Попробуйте еще раз.")

async def handle_all_messages(update: Update, context: CallbackContext):
    """Обрабатывает все остальные сообщения"""
    user = update.effective_user
    message = update.message
    
    print(f"📝 Получено сообщение от {user.id}: {message.text[:50]}...")
    
    # Проверяем, не является ли это данными от Mini Apps в текстовом формате
    if message.text and message.text.startswith('{') and message.text.endswith('}'):
        try:
            data = json.loads(message.text)
            if 'step' in data or 'email' in data:
                print("📱 Обнаружены данные Mini Apps в текстовом формате")
                await handle_web_app_data_from_text(update, context)
                return
        except Exception as e:
            print(f"❌ Ошибка парсинга JSON: {e}")
    
    # Обычная обработка сообщений
    if user.id in ADMIN_IDS:
        # Админские команды
        await message.reply_text("👨‍💼 Админская панель")
    else:
        await start(update, context)

async def button(update: Update, context: CallbackContext):
    """Обрабатывает нажатия кнопок"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "payment_menu":
        await payment_menu(update, context)
    elif query.data == "lava_payment":
        await handle_lava_payment(update, context)
    elif query.data == "more_info":
        await more_info(update, context)
    elif query.data == "back_to_start":
        await start(update, context)

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с POLLING...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
    print(f"🔑 LAVA_SECRET_KEY: {LAVA_SECRET_KEY[:20]}...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
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
    
    # Удаляем webhook и используем polling
    print("🗑️ Удаляем webhook для использования polling...")
    try:
        delete_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
        delete_response = requests.post(delete_webhook_url)
        print(f"🗑️ Удаление webhook: {delete_response.status_code} - {delete_response.text}")
        
        # Проверяем, что webhook удален
        get_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        webhook_info = requests.get(get_webhook_url)
        webhook_result = webhook_info.json()
        print(f"📋 Информация о webhook после удаления: {webhook_result}")
        
        if webhook_result.get('ok') and not webhook_result.get('result', {}).get('url'):
            print("✅ Webhook успешно удален!")
        else:
            print("❌ Webhook не удален!")
            
    except Exception as e:
        print(f"❌ Ошибка удаления webhook: {e}")
    
    print("🔄 Запускаем polling в отдельном потоке...")
    
    # Запускаем polling в отдельном потоке
    import threading
    def run_polling():
        try:
            print("🔄 Запуск polling...")
            application.run_polling(allowed_updates=["message", "callback_query"])
        except Exception as e:
            print(f"❌ Ошибка polling: {e}")
    
    polling_thread = threading.Thread(target=run_polling, daemon=True)
    polling_thread.start()
    print("✅ Polling запущен в отдельном потоке")
    
    print("🚀 Запуск Flask приложения...")
    
    # Запускаем Flask приложение
    app.run(host='0.0.0.0', port=8080, debug=False)

if __name__ == '__main__':
    main()
