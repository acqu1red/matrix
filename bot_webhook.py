#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment
"""

import os
import logging
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from supabase import create_client, Client

# Email отправка отключена - используем только Telegram
def send_email_invitation(email, tariff, subscription_id):
    print(f"📧 Email отправка отключена: {email}, тариф: {tariff}")
    return True

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
        "webhook_url": f"https://formulaprivate-production.up.railway.app/webhook"
    })

# Webhook endpoint для Telegram
@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    """Обрабатывает webhook от Telegram"""
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН WEBHOOK ОТ TELEGRAM!")
        print("=" * 50)
        print(f"📋 Headers: {dict(request.headers)}")
        print(f"📋 Method: {request.method}")
        print(f"📋 URL: {request.url}")
        
        # Получаем данные от Telegram
        data = request.get_json()
        print(f"📋 Данные от Telegram: {data}")
        
        # Передаем данные в обработчик бота
        if hasattr(app, 'telegram_app'):
            print("✅ Передаем данные в telegram_app")
            
            # Создаем Update объект
            update = Update.de_json(data, app.telegram_app.bot)
            print(f"📋 Update создан: {update}")
            
            # Запускаем обработку в отдельном потоке
            import threading
            def process_update_async():
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    loop.run_until_complete(app.telegram_app.process_update(update))
                    print("✅ Данные обработаны асинхронно")
                except Exception as e:
                    print(f"❌ Ошибка асинхронной обработки: {e}")
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
                import json
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
LAVA_PRODUCT_ID = os.getenv('LAVA_PRODUCT_ID', '302ecdcd-1581-45ad-8353-a168f347b8cc')

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
            [InlineKeyboardButton("💳 Оплатить", web_app=WebAppInfo(url="https://formulaprivate-production.up.railway.app/payment.html"))],
            [InlineKeyboardButton("🔙 Назад", callback_data="payment_menu")]
        ])
    )

async def handle_web_app_data(update: Update, context: CallbackContext):
    """Обрабатывает данные от Mini Apps"""
    print("🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!")
    user = update.effective_user
    message = update.message
    
    try:
        # Парсим данные от Mini Apps
        web_app_data = message.web_app_data.data
        print(f"📱 Получены данные от Mini Apps: {web_app_data}")
        
        # Парсим JSON данные
        import json
        payment_data = json.loads(web_app_data)
        print(f"📋 Парсированные данные: {payment_data}")
        
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
            print(f"🏦 Получен payment method: {payment_method}, банк: {bank}")
            await message.reply_text(f"🏦 Payment method получен: {payment_method}, банк: {bank}")
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
                await message.reply_text("❌ Не все данные получены. Попробуйте еще раз.")
                return
            
            # Создаем инвойс через Lava Top API
            invoice_data = {
                "shop_id": LAVA_SHOP_ID,
                "amount": int(price * 100),  # Конвертируем в копейки
                "currency": "RUB",
                "order_id": f"order_{user.id}_{int(datetime.now().timestamp())}",
                "hook_url": f"https://formulaprivate-production.up.railway.app/lava-webhook",
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
                
    except Exception as e:
        print(f"❌ Ошибка обработки данных Mini Apps: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
    
    # Fallback - отправляем сообщение об ошибке
    await message.reply_text(
        "❌ Произошла ошибка при создании платежа. Попробуйте еще раз или обратитесь в поддержку."
    )

async def handle_all_messages(update: Update, context: CallbackContext):
    """Обрабатывает все сообщения от пользователей"""
    user = update.effective_user
    message = update.message
    
    print(f"📨 Получено сообщение от пользователя {user.id}")
    print(f"📋 Тип сообщения: {type(message)}")
    print(f"📋 Атрибуты сообщения: {dir(message)}")
    print(f"📋 Содержимое сообщения: {message.text if hasattr(message, 'text') else 'Нет текста'}")
    print(f"📋 web_app_data: {getattr(message, 'web_app_data', 'НЕТ')}")
    print(f"📋 hasattr web_app_data: {hasattr(message, 'web_app_data')}")
    if hasattr(message, 'web_app_data') and message.web_app_data:
        print(f"📋 web_app_data.data: {getattr(message.web_app_data, 'data', 'НЕТ DATA')}")
        print(f"📋 web_app_data.type: {getattr(message.web_app_data, 'type', 'НЕТ TYPE')}")
    
    # Проверяем, является ли это данными от Mini Apps
    if hasattr(message, 'web_app_data'):
        print(f"📱 web_app_data найден: {message.web_app_data}")
        if message.web_app_data and hasattr(message.web_app_data, 'data') and message.web_app_data.data:
            print(f"📱 Обнаружены данные от Mini Apps: {message.web_app_data.data}")
            await handle_web_app_data(update, context)
            return
        else:
            print(f"📱 web_app_data пустой или без data")
    else:
        print(f"📱 web_app_data не найден")
    
    # Проверяем, является ли это JSON данными в тексте
    if message.text:
        try:
            import json
            data = json.loads(message.text)
            if isinstance(data, dict) and 'step' in data:
                print(f"📱 Обнаружены JSON данные в тексте: {data}")
                await handle_web_app_data_from_text(update, context, data)
                return
        except:
            pass
    
    # Обычное сообщение
    await message.reply_text(
        "👋 Используйте команду /start для начала работы с ботом!"
    )

async def handle_web_app_data_from_text(update: Update, context: CallbackContext, payment_data: dict):
    """Обрабатывает данные от Mini Apps, полученные через обычное сообщение"""
    user = update.effective_user
    message = update.message
    
    try:
        print(f"📱 Обрабатываем данные из текста: {payment_data}")
        
        # Проверяем тип данных (пошаговая отправка)
        step = payment_data.get('step')
        print(f"📋 Шаг данных из текста: {step}")
        
        if step == 'test_connection':
            print("✅ Тестовое соединение получено из текста!")
            await message.reply_text("✅ Соединение с ботом установлено!")
            return
            
        elif step == 'email_data':
            email = payment_data.get('email')
            print(f"📧 Получен email из текста: {email}")
            await message.reply_text(f"📧 Email получен: {email}")
            return
            
        elif step == 'tariff_data':
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            print(f"💳 Получен tariff из текста: {tariff}, цена: {price}")
            await message.reply_text(f"💳 Tariff получен: {tariff}, цена: {price}₽")
            return
            
        elif step == 'payment_method_data':
            payment_method = payment_data.get('paymentMethod')
            bank = payment_data.get('bank')
            print(f"🏦 Получен payment method из текста: {payment_method}, банк: {bank}")
            await message.reply_text(f"🏦 Payment method получен: {payment_method}, банк: {bank}")
            return
            
        elif step == 'user_id_data':
            user_id = payment_data.get('userId')
            print(f"👤 Получен user ID из текста: {user_id}")
            await message.reply_text(f"👤 User ID получен: {user_id}")
            return
            
        elif step == 'final_data':
            # Обрабатываем финальные данные
            email = payment_data.get('email')
            tariff = payment_data.get('tariff')
            price = payment_data.get('price')
            user_id = payment_data.get('userId')
            print(f"🎯 Обрабатываем финальные данные из текста: email={email}, tariff={tariff}, price={price}, user_id={user_id}")
            
            # Проверяем, что все данные есть
            if not email or not tariff or not price:
                await message.reply_text("❌ Не все данные получены. Попробуйте еще раз.")
                return
        
        # Извлекаем данные
        email = payment_data.get('email')
        tariff = payment_data.get('tariff')
        price = payment_data.get('price')
        user_id = payment_data.get('userId')
        
        # Создаем инвойс через Lava Top API
        invoice_data = {
            "shop_id": LAVA_SHOP_ID,
            "amount": int(price * 100),  # Конвертируем в копейки
            "currency": "RUB",
            "order_id": f"order_{user.id}_{int(datetime.now().timestamp())}",
            "hook_url": f"https://formulaprivate-production.up.railway.app/lava-webhook",
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
            
    except Exception as e:
        print(f"❌ Ошибка обработки данных из текста: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
    
    # Fallback - отправляем сообщение об ошибке
    await message.reply_text(
        "❌ Произошла ошибка при создании платежа. Попробуйте еще раз или обратитесь в поддержку."
    )

async def button(update: Update, context: CallbackContext):
    """Обработчик нажатий на кнопки"""
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
    if webhook_url:
        print(f"🌐 Настройка webhook: {webhook_url}/webhook")
        # Устанавливаем webhook URL через requests (синхронно)
        webhook_setup_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
        webhook_data = {
            "url": f"{webhook_url}/webhook",
            "secret_token": os.getenv('WEBHOOK_SECRET', 'Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c')
        }
        
        print(f"🔧 Webhook данные: {webhook_data}")
        
        try:
            response = requests.post(webhook_setup_url, json=webhook_data)
            print(f"📡 Ответ установки webhook: {response.status_code} - {response.text}")
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
                
                # Проверяем текущий webhook
                get_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
                webhook_info = requests.get(get_webhook_url)
                print(f"📋 Информация о webhook: {webhook_info.json()}")
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
    else:
        print("⚠️ RAILWAY_STATIC_URL не установлен")
        
        try:
            response = requests.post(webhook_setup_url, json=webhook_data)
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
    
    print("🚀 Запуск Flask приложения...")
    # Запускаем Flask приложение
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
