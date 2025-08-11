#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment
"""

import os
import logging
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, CallbackContext, ChatMemberHandler
from datetime import datetime, timedelta
import requests
from supabase import create_client, Client
from channel_manager import ChannelManager
from flask import Flask, request, jsonify

# Импортируем функцию отправки email
try:
    from email_invitation import send_email_invitation
except ImportError:
    def send_email_invitation(email, tariff, subscription_id):
        print(f"📧 Email отправка отключена: {email}, тариф: {tariff}")
        return True

# Создаем Flask приложение для health check
app = Flask(__name__)

# Health check endpoint для Railway
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "telegram-bot-webhook"})

# Webhook endpoint для Telegram
@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    """Обрабатывает webhook от Telegram"""
    try:
        # Получаем данные от Telegram
        data = request.get_json()
        
        # Передаем данные в обработчик бота
        if hasattr(app, 'telegram_app'):
            app.telegram_app.process_update(Update.de_json(data, app.telegram_app.bot))
        
        return jsonify({"status": "ok"})
    except Exception as e:
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
        print(f"📋 Headers: {dict(request.headers)}")
        print(f"📋 Method: {request.method}")
        print(f"📋 URL: {request.url}")
        print(f"📋 Content-Type: {request.content_type}")
        print(f"📋 Content-Length: {request.content_length}")
        
        # Временно отключаем проверку API key для диагностики
        print("🔍 Проверяем заголовки аутентификации...")
        api_key_header = request.headers.get('X-API-Key') or request.headers.get('Authorization')
        if api_key_header:
            # Убираем 'Bearer ' если есть
            if api_key_header.startswith('Bearer '):
                api_key_header = api_key_header[7:]
            
            print(f"🔐 API Key получен: {api_key_header[:10]}...")
            
            # Проверяем API key
            expected_api_key = 'lava_webhook_secret_2024_secure_key'
            if api_key_header != expected_api_key:
                print("❌ Неверный API key")
                # Временно разрешаем для диагностики
                print("⚠️ Временно разрешаем доступ для диагностики")
        else:
            print("⚠️ API key не найден в заголовках")
            print("🔍 Все заголовки:", dict(request.headers))
            # Временно разрешаем для диагностики
            print("⚠️ Временно разрешаем доступ для диагностики")
        
        # Поддерживаем GET и POST запросы
        if request.method == 'GET':
            print("🔍 GET запрос от Lava Top - обрабатываем как webhook")
            print("🔍 GET параметры:", request.args.to_dict())
            print("🔍 GET данные:", request.get_data())
        elif request.method != 'POST':
            return jsonify({"status": "error", "message": "Only GET and POST methods allowed"}), 405
        
        # Получаем данные
        data = request.get_json()
        print(f"📋 Данные платежа: {data}")
        
        # Если данных нет, пробуем получить из form data
        if not data:
            data = request.form.to_dict()
            print(f"📋 Данные из form: {data}")
        
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
        
        user_id = metadata.get('user_id')
        tariff = metadata.get('tariff')
        email = metadata.get('email')
        
        print(f"💰 Статус: {payment_status}, Заказ: {order_id}, Сумма: {amount} {currency}")
        print(f"👤 Пользователь: {user_id}, Тариф: {tariff}, Email: {email}")
        
        if payment_status == 'success':
            # Создаем подписку в базе данных
            subscription_id = create_subscription(user_id, email, tariff, amount, currency, order_id, metadata)
            
            # Отправляем сообщения везде одновременно
            print(f"📤 Отправка уведомлений пользователю...")
            
            # Всегда отправляем в Telegram (если есть user_id)
            if user_id:
                print(f"📱 Отправляем сообщение в Telegram пользователю {user_id}")
                send_success_message_to_user(user_id, tariff, subscription_id)
            else:
                print("⚠️ user_id не найден - пропускаем отправку в Telegram")
            
            # Всегда отправляем на email (если есть email)
            if email:
                print(f"📧 Отправляем приглашение на email {email}")
                send_email_invitation(email, tariff, subscription_id)
            else:
                print("⚠️ Email не найден - пропускаем отправку на email")
            
            # Логируем результат отправки
            sent_to = []
            if user_id:
                sent_to.append("Telegram")
            if email:
                sent_to.append("Email")
            
            if sent_to:
                print(f"✅ Уведомления отправлены: {', '.join(sent_to)}")
            else:
                print("❌ КРИТИЧЕСКАЯ ОШИБКА: Нет ни user_id, ни email для отправки уведомления!")
                print(f"📋 Все данные платежа: {data}")
            
            # Отправляем уведомление администраторам
            send_admin_notification(user_id or "unknown", email, tariff, amount, currency, order_id)
            
            print("✅ Платеж обработан успешно")
        else:
            print(f"❌ Платеж не прошел: {payment_status}")
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"❌ Ошибка обработки Lava Top webhook: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        logging.error(f"Ошибка обработки Lava Top webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500



# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', '')  # Будет установлен Railway
WEBHOOK_PATH = '/webhook'

# Администраторы
# Получаем ADMIN_IDS из переменных окружения или используем значения по умолчанию
admin_ids_str = os.getenv('ADMIN_IDS', '708907063,7365307696')
ADMIN_IDS = [int(id.strip()) for id in admin_ids_str.split(',') if id.strip()]
ADMIN_USERNAMES = ['your_admin_username']  # Замените на реальные username

# Supabase конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://uhhsrtmmuwoxsdquimaa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Инициализация менеджера каналов
channel_manager = ChannelManager()

# Lava Top конфигурация
LAVA_SHOP_ID = os.getenv('LAVA_SHOP_ID', '1b9f3e05-86aa-4102-9648-268f0f586bb1')
LAVA_SECRET_KEY = os.getenv('LAVA_SECRET_KEY', 'whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav')

def create_subscription(user_id, email, tariff, amount, currency, order_id, metadata):
    """Создает подписку в базе данных"""
    try:
        # Определяем длительность подписки
        tariff_durations = {
            '1month': 30,
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
        
        result = supabase.table('subscriptions').insert(subscription_data).execute()
        print(f"✅ Подписка создана: {result}")
        return result.data[0]['id'] if result.data else None
        
    except Exception as e:
        print(f"❌ Ошибка создания подписки: {e}")
        return None

def send_success_message_to_user(user_id, tariff, subscription_id):
    """Отправляет сообщение об успешной оплате пользователю"""
    try:
        print(f"📤 Отправка сообщения пользователю {user_id}")
        
        # Формируем сообщение
        message = f"""
🎉 <b>Оплата прошла успешно!</b>

Ваша подписка активирована!
Тариф: {tariff}

🔗 <b>Присоединяйтесь к закрытому каналу:</b>
https://t.me/+6SQb4RwwAmZlMWQ6

⏰ Подписка активна до: {datetime.utcnow() + timedelta(days=30)}

С уважением, канал Формула.
"""
        
        # Отправляем сообщение через Telegram Bot API
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": user_id,
            "text": message,
            "parse_mode": "HTML"
        }
        
        print(f"📤 Отправляем запрос: {url}")
        print(f"📤 Данные: {data}")
        
        response = requests.post(url, json=data)
        print(f"📤 Ответ: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            print(f"✅ Сообщение отправлено пользователю {user_id}")
        else:
            print(f"❌ Ошибка отправки сообщения: {response.text}")
            
    except Exception as e:
        print(f"❌ Ошибка отправки сообщения пользователю: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")

def send_admin_notification(user_id, email, tariff, amount, currency, order_id):
    """Отправляет уведомление администраторам"""
    try:
        message = f"""
💰 <b>Новый успешный платеж!</b>

👤 Пользователь: {user_id}
📧 Email: {email}
📦 Тариф: {tariff}
💵 Сумма: {amount} {currency}
🆔 Заказ: {order_id}
⏰ Время: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}
"""
        
        # Отправляем уведомление всем администраторам
        for admin_id in ADMIN_IDS:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            data = {
                "chat_id": admin_id,
                "text": message,
                "parse_mode": "HTML"
            }
            
            response = requests.post(url, json=data)
            if response.status_code == 200:
                print(f"✅ Уведомление отправлено администратору {admin_id}")
            else:
                print(f"❌ Ошибка отправки уведомления администратору {admin_id}")
                
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления администраторам: {e}")

def check_and_remove_expired_subscriptions():
    """Проверяет и удаляет пользователей с истекшей подпиской"""
    try:
        print("🔍 Проверка истекших подписок...")
        
        # Проверяем существование таблицы
        try:
            # Получаем истекшие подписки
            current_time = datetime.utcnow().isoformat()
            result = supabase.table('subscriptions').select('*').eq('status', 'active').lt('end_date', current_time).execute()
            
            if not result.data:
                print("✅ Нет истекших подписок")
                return
            
            print(f"📋 Найдено {len(result.data)} истекших подписок")
            
            for subscription in result.data:
                user_id = subscription['user_id']
                tariff = subscription['tariff']
                
                # Исключаем пользователя из канала
                remove_user_from_channel(user_id)
                
                # Отправляем уведомление пользователю
                send_expired_subscription_message(user_id, tariff)
                
                # Обновляем статус подписки
                supabase.table('subscriptions').update({'status': 'expired'}).eq('id', subscription['id']).execute()
                
                print(f"✅ Пользователь {user_id} исключен из канала")
                
        except Exception as table_error:
            print(f"❌ Ошибка доступа к таблице subscriptions: {table_error}")
            print("📋 Возможно, таблица не существует. Создайте её с помощью SQL скрипта.")
            
    except Exception as e:
        print(f"❌ Ошибка проверки истекших подписок: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")

def remove_user_from_channel(user_id):
    """Исключает пользователя из канала (без черного списка)"""
    try:
        # ID вашего канала (замените на реальный)
        channel_id = "@formula_channel"  # или -100xxxxxxxxx
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/unbanChatMember"
        data = {
            "chat_id": channel_id,
            "user_id": user_id,
            "only_if_banned": False
        }
        
        # Сначала разбаниваем (если был забанен)
        response = requests.post(url, json=data)
        
        # Затем исключаем из канала
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/banChatMember"
        data = {
            "chat_id": channel_id,
            "user_id": user_id,
            "until_date": int((datetime.utcnow() + timedelta(seconds=30)).timestamp()),
            "revoke_messages": False
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Пользователь {user_id} исключен из канала")
        else:
            print(f"❌ Ошибка исключения пользователя {user_id}: {response.text}")
            
    except Exception as e:
        print(f"❌ Ошибка исключения пользователя из канала: {e}")

def send_expired_subscription_message(user_id, tariff):
    """Отправляет сообщение об окончании подписки"""
    try:
        message = f"""
⏰ <b>Ваша подписка закончилась</b>

К сожалению, срок действия вашей подписки истек.
Тариф: {tariff}

Но не расстраивайтесь! Вы можете продлить подписку в любой момент и снова получить доступ к эксклюзивному контенту.

Нажмите кнопку ниже, чтобы продлить подписку:
"""
        
        # Создаем inline кнопку с Mini App
        keyboard = [
            [InlineKeyboardButton("💳 Продлить подписку", web_app=WebAppInfo(url="https://app.lava.top/ru/products/1b9f3e05-86aa-4102-9648-268f0f586bb1/7357f3c8-bd27-462d-831a-a1eefe4ccd09?currency=RUB"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Отправляем сообщение
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": user_id,
            "text": message,
            "parse_mode": "HTML",
            "reply_markup": reply_markup.to_dict()
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Сообщение об окончании подписки отправлено пользователю {user_id}")
        else:
            print(f"❌ Ошибка отправки сообщения: {response.text}")
            
    except Exception as e:
        print(f"❌ Ошибка отправки сообщения об окончании подписки: {e}")

async def save_message_to_db(user, message):
    """Сохраняет сообщение пользователя в базу данных"""
    try:
        data = {
            'user_id': str(user.id),
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'message_text': message.text if hasattr(message, 'text') else 'Медиа сообщение',
            'message_type': 'text' if hasattr(message, 'text') else 'media',
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('user_messages').insert(data).execute()
        print(f"✅ Сообщение сохранено в БД: {result}")
        return True
    except Exception as e:
        print(f"❌ Ошибка сохранения сообщения: {e}")
        return False

async def handle_all_messages(update: Update, context: CallbackContext) -> None:
    """Обрабатывает все сообщения от пользователей"""
    user = update.effective_user
    message = update.message
    
    # Сохраняем сообщение в базу данных
    await save_message_to_db(user, message)
    
    # Отправляем уведомление администраторам
    admin_message = f"💬 <b>Новое сообщение от пользователя</b>\n\n"
    admin_message += f"👤 <b>Пользователь:</b> {user.first_name}"
    if user.last_name:
        admin_message += f" {user.last_name}"
    if user.username:
        admin_message += f" (@{user.username})"
    admin_message += f"\n🆔 <b>ID:</b> {user.id}\n"
    
    if hasattr(message, 'text') and message.text:
        admin_message += f"📝 <b>Сообщение:</b> {message.text}\n"
    else:
        admin_message += f"📎 <b>Тип:</b> Медиа сообщение\n"
    
    admin_message += f"\n⏰ <b>Время:</b> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}"
    
    # Кнопка для ответа
    keyboard = [
        [InlineKeyboardButton("Ответить", callback_data=f"reply_{user.id}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Отправляем уведомление всем администраторам
    for admin_id in ADMIN_IDS:
        try:
            await context.bot.send_message(
                chat_id=admin_id,
                text=admin_message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
        except Exception as e:
            print(f"Ошибка отправки уведомления администратору {admin_id}: {e}")

async def start(update: Update, context: CallbackContext) -> None:
    """Обработчик команды /start"""
    content = build_start_content()
    await update.message.reply_text(content['text'], parse_mode='HTML', reply_markup=content['reply_markup'])

async def payment(update: Update, context: CallbackContext) -> None:
    """Обработчик команды /payment"""
    content = build_payment_content()
    await update.message.reply_text(content['text'], parse_mode='HTML', reply_markup=content['reply_markup'])

async def more_info(update: Update, context: CallbackContext) -> None:
    """Обработчик команды /more_info"""
    content = build_more_info_content()
    await update.message.reply_text(content['text'], parse_mode='HTML', reply_markup=content['reply_markup'])

async def cancel_reply(update: Update, context: CallbackContext) -> None:
    """Отменяет режим ответа администратора"""
    user = update.effective_user
    
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.message.reply_text("У вас нет прав для выполнения этого действия!")
        return
    
    if 'waiting_for_reply' in context.user_data:
        del context.user_data['waiting_for_reply']
        if 'replying_to' in context.user_data:
            del context.user_data['replying_to']
        
        await update.message.reply_text("✅ Режим ответа отменен")

async def admin_messages(update: Update, context: CallbackContext) -> None:
    """Показывает последние сообщения пользователей администратору"""
    user = update.effective_user
    
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.message.reply_text("У вас нет прав для выполнения этого действия!")
        return
    
    try:
        # Получаем последние 10 сообщений
        result = supabase.table('user_messages').select('*').order('created_at', desc=True).limit(10).execute()
        
        if not result.data:
            await update.message.reply_text("📭 Нет сообщений от пользователей")
            return
        
        message_text = "📋 <b>Последние сообщения пользователей:</b>\n\n"
        
        for msg in result.data:
            user_info = f"{msg['first_name']}"
            if msg['last_name']:
                user_info += f" {msg['last_name']}"
            if msg['username']:
                user_info += f" (@{msg['username']})"
            
            message_text += f"👤 <b>{user_info}</b> (ID: {msg['user_id']})\n"
            message_text += f"📝 {msg['message_text'][:100]}...\n"
            message_text += f"⏰ {msg['created_at'][:19]}\n\n"
        
        await update.message.reply_text(message_text, parse_mode='HTML')
        
    except Exception as e:
        print(f"Ошибка получения сообщений: {e}")
        await update.message.reply_text(f"❌ Ошибка получения сообщений: {str(e)}")

async def button(update: Update, context: CallbackContext) -> None:
    """Обработчик нажатий на кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data.startswith('reply_'):
        user_id = query.data.split('_')[1]
        await handle_admin_reply(update, context, user_id)
    elif query.data.startswith('payment_'):
        await handle_payment_selection(update, context, query.data)
    elif query.data == 'lava_payment':
        await handle_lava_payment(update, context)
    elif query.data == 'more_info':
        content = build_more_info_content()
        await query.edit_message_text(content['text'], parse_mode='HTML', reply_markup=content['reply_markup'])

async def handle_payment_selection(update: Update, context: CallbackContext, payment_type: str):
    """Обрабатывает выбор типа оплаты"""
    query = update.callback_query
    
    payment_options = {
        'payment_1month': {'duration': 30, 'label': '1 месяц', 'amount': 1000},
        'payment_3months': {'duration': 90, 'label': '3 месяца', 'amount': 2500},
        'payment_6months': {'duration': 180, 'label': '6 месяцев', 'amount': 4500},
        'payment_12months': {'duration': 365, 'label': '12 месяцев', 'amount': 8000}
    }
    
    if payment_type not in payment_options:
        await query.edit_message_text("❌ Неизвестный тип оплаты")
        return
    
    option = payment_options[payment_type]
    checkout_content = build_checkout_content(option['label'])
    
    await query.edit_message_text(
        checkout_content['text'],
        parse_mode='HTML',
        reply_markup=checkout_content['reply_markup']
    )

async def handle_lava_payment(update: Update, context: CallbackContext):
    """Обрабатывает нажатие кнопки оплаты через Lava Top"""
    try:
        user = update.effective_user
        print(f"💳 Пользователь {user.id} нажал кнопку оплаты")
        
        # Получаем данные о выбранном тарифе
        tariff = context.user_data.get('selected_tariff', 'Подписка на 30 дней')
        amount = context.user_data.get('selected_amount', 50)
        
        # Создаем заказ в Lava Top
        order_id = f"order_{user.id}_{int(datetime.now().timestamp())}"
        
        # Сохраняем данные для webhook
        metadata = {
            'user_id': str(user.id),
            'tariff': tariff,
            'email': user.email if hasattr(user, 'email') else None
        }
        
        # Сохраняем ожидающий платеж в базу данных
        pending_payment = {
            'order_id': order_id,
            'user_id': str(user.id),
            'tariff': tariff,
            'amount': amount,
            'currency': 'RUB',
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'metadata': metadata
        }
        
        try:
            supabase.table('pending_payments').insert(pending_payment).execute()
            print(f"✅ Ожидающий платеж сохранен: {order_id}")
        except Exception as e:
            print(f"⚠️ Ошибка сохранения платежа в БД: {e}")
        
        # URL для оплаты
        payment_url = f"https://app.lava.top/ru/products/{os.getenv('LAVA_SHOP_ID')}/7357f3c8-bd27-462d-831a-a1eefe4ccd09?currency=RUB&order_id={order_id}&metadata={json.dumps(metadata)}"
        
        # Отправляем сообщение с ссылкой на оплату
        message = f"""
💳 <b>Оплата через Lava Top</b>

Тариф: {tariff}
Сумма: {amount} ₽
Заказ: {order_id}

🔗 <a href="{payment_url}">Перейти к оплате</a>

После оплаты вы получите приглашение в закрытый канал.
Проверка статуса происходит автоматически.
"""
        
        await update.callback_query.edit_message_text(
            text=message,
            parse_mode='HTML',
            disable_web_page_preview=True
        )
        
    except Exception as e:
        print(f"❌ Ошибка обработки оплаты: {e}")
        await update.callback_query.edit_message_text(
            text="❌ Произошла ошибка при создании платежа. Попробуйте позже."
        )

def build_start_content():
    """Создает контент для команды /start"""
    text = """
🚀 <b>Добро пожаловать в наш бот!</b>

Здесь вы можете:
• 💳 Оплатить подписку
• ℹ️ Получить дополнительную информацию
• 📞 Связаться с поддержкой

Выберите действие:
"""
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить", callback_data="payment_menu")],
        [InlineKeyboardButton("ℹ️ Подробнее", callback_data="more_info")]
    ]
    
    return {
        'text': text,
        'reply_markup': InlineKeyboardMarkup(keyboard)
    }

def build_payment_content():
    """Создает контент для меню оплаты"""
    text = """
💳 <b>Выберите тариф подписки:</b>

• 1 месяц - 1000₽
• 3 месяца - 2500₽ (экономия 500₽)
• 6 месяцев - 4500₽ (экономия 1500₽)
• 12 месяцев - 8000₽ (экономия 4000₽)
"""
    
    keyboard = [
        [InlineKeyboardButton("1 месяц - 1000₽", callback_data="payment_1month")],
        [InlineKeyboardButton("3 месяца - 2500₽", callback_data="payment_3months")],
        [InlineKeyboardButton("6 месяцев - 4500₽", callback_data="payment_6months")],
        [InlineKeyboardButton("12 месяцев - 8000₽", callback_data="payment_12months")],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    
    return {
        'text': text,
        'reply_markup': InlineKeyboardMarkup(keyboard)
    }

def build_more_info_content():
    """Создает контент для дополнительной информации"""
    text = """
ℹ️ <b>Дополнительная информация</b>

📋 <b>Что включено в подписку:</b>
• Доступ к закрытому каналу
• Эксклюзивный контент
• Поддержка 24/7
• Персональные консультации

📞 <b>Поддержка:</b>
• Email: support@example.com
• Telegram: @support_username

💡 <b>Вопросы?</b>
Напишите нам, и мы ответим в течение 24 часов.
"""
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить", callback_data="payment_menu")],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    
    return {
        'text': text,
        'reply_markup': InlineKeyboardMarkup(keyboard)
    }

def build_checkout_content(duration_label: str):
    """Создает контент для оформления заказа"""
    text = f"""
💳 <b>Оформление заказа</b>

📦 <b>Тариф:</b> {duration_label}
💰 <b>Стоимость:</b> Согласно выбранному тарифу

Для оплаты нажмите кнопку ниже:
"""
    
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить через Lava Top", callback_data="lava_payment")],
        [InlineKeyboardButton("🔙 Назад к тарифам", callback_data="payment_menu")]
    ]
    
    return {
        'text': text,
        'reply_markup': InlineKeyboardMarkup(keyboard)
    }

async def handle_admin_reply(update: Update, context: CallbackContext, user_id: str) -> None:
    """Обрабатывает нажатие кнопки 'Ответить' администратором"""
    query = update.callback_query
    admin_user = update.effective_user
    
    if admin_user.id not in ADMIN_IDS and (admin_user.username is None or admin_user.username not in ADMIN_USERNAMES):
        await query.answer("У вас нет прав для выполнения этого действия!")
        return
    
    context.user_data['replying_to'] = user_id
    context.user_data['waiting_for_reply'] = True
    
    reply_text = f"💬 <b>Ответ пользователю {user_id}</b>\n\n"
    reply_text += "Напишите ваш ответ. Он будет отправлен пользователю.\n"
    reply_text += "Для отмены напишите /cancel"
    
    await query.edit_message_text(text=reply_text, parse_mode='HTML')

async def check_expired_subscriptions(update: Update, context: CallbackContext) -> None:
    """Проверяет и удаляет пользователей с истекшей подпиской"""
    user = update.effective_user
    
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.effective_message.reply_text("У вас нет прав для выполнения этого действия!")
        return
    
    try:
        await channel_manager.remove_expired_users(context)
        
        await update.effective_message.reply_text(
            "✅ <b>Проверка истекших подписок завершена!</b>\n\n"
            "Все пользователи с истекшей подпиской удалены из канала.",
            parse_mode='HTML'
        )
        
    except Exception as e:
        print(f"Ошибка проверки истекших подписок: {e}")
        await update.effective_message.reply_text(
            f"❌ <b>Ошибка проверки подписок:</b> {str(e)}",
            parse_mode='HTML'
        )

# Добавляем функцию для проверки платежей через API
def check_payment_status(order_id):
    """Проверяет статус платежа через API Lava Top"""
    try:
        print(f"🔍 Проверяем статус платежа: {order_id}")
        
        # API Lava Top для проверки статуса
        api_url = f"https://api.lava.top/business/invoice/status"
        
        headers = {
            "Authorization": f"Bearer {os.getenv('LAVA_SECRET_KEY')}",
            "Content-Type": "application/json"
        }
        
        data = {
            "shop_id": os.getenv('LAVA_SHOP_ID'),
            "order_id": order_id
        }
        
        response = requests.post(api_url, json=data, headers=headers)
        print(f"📋 Ответ API: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            status = result.get('status')
            print(f"💰 Статус платежа: {status}")
            return status == 'success', result
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"❌ Ошибка проверки платежа: {e}")
        return False, None

def process_successful_payment(payment_data):
    """Обрабатывает успешный платеж"""
    try:
        print("🎉 Обработка успешного платежа!")
        
        # Извлекаем данные
        order_id = payment_data.get('order_id')
        amount = payment_data.get('amount')
        currency = payment_data.get('currency')
        metadata = payment_data.get('metadata', {})
        
        # Если metadata это строка, пробуем распарсить JSON
        if isinstance(metadata, str):
            try:
                import json
                metadata = json.loads(metadata)
            except:
                metadata = {}
        
        user_id = metadata.get('user_id')
        tariff = metadata.get('tariff', 'Подписка на 30 дней')
        email = metadata.get('email')
        
        print(f"💰 Заказ: {order_id}, Сумма: {amount} {currency}")
        print(f"👤 Пользователь: {user_id}, Тариф: {tariff}, Email: {email}")
        
        # Создаем подписку в базе данных
        subscription_id = create_subscription(user_id, email, tariff, amount, currency, order_id, metadata)
        
        # Отправляем сообщения везде одновременно
        print(f"📤 Отправка уведомлений пользователю...")
        
        # Всегда отправляем в Telegram (если есть user_id)
        if user_id:
            print(f"📱 Отправляем сообщение в Telegram пользователю {user_id}")
            send_success_message_to_user(user_id, tariff, subscription_id)
        else:
            print("⚠️ user_id не найден - пропускаем отправку в Telegram")
        
        # Всегда отправляем на email (если есть email)
        if email:
            print(f"📧 Отправляем приглашение на email {email}")
            send_email_invitation(email, tariff, subscription_id)
        else:
            print("⚠️ Email не найден - пропускаем отправку на email")
        
        # Логируем результат отправки
        sent_to = []
        if user_id:
            sent_to.append("Telegram")
        if email:
            sent_to.append("Email")
        
        if sent_to:
            print(f"✅ Уведомления отправлены: {', '.join(sent_to)}")
        else:
            print("❌ КРИТИЧЕСКАЯ ОШИБКА: Нет ни user_id, ни email для отправки уведомления!")
            print(f"📋 Все данные платежа: {payment_data}")
        
        # Отправляем уведомление администраторам
        send_admin_notification(user_id or "unknown", email, tariff, amount, currency, order_id)
        
        print("✅ Платеж обработан успешно")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка обработки платежа: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

# Добавляем функцию для периодической проверки платежей
def check_pending_payments():
    """Проверяет все ожидающие платежи"""
    try:
        print("🔍 Проверка ожидающих платежей...")
        
        # Получаем ожидающие платежи из базы данных
        result = supabase.table('pending_payments').select('*').eq('status', 'pending').execute()
        
        if not result.data:
            print("✅ Нет ожидающих платежей")
            return
        
        print(f"📋 Найдено {len(result.data)} ожидающих платежей")
        
        for payment in result.data:
            order_id = payment.get('order_id')
            if order_id:
                # Проверяем статус платежа
                is_success, payment_data = check_payment_status(order_id)
                
                if is_success:
                    print(f"✅ Платеж {order_id} успешен!")
                    # Обрабатываем успешный платеж
                    if process_successful_payment(payment_data):
                        # Удаляем из ожидающих
                        supabase.table('pending_payments').delete().eq('order_id', order_id).execute()
                        print(f"✅ Платеж {order_id} обработан и удален из ожидающих")
                else:
                    print(f"⏳ Платеж {order_id} еще в обработке")
        
    except Exception as e:
        print(f"❌ Ошибка проверки платежей: {e}")

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с webhook...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    print(f"👥 Администраторы по username: {ADMIN_USERNAMES}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.telegram_app = application # Привязываем приложение к Flask
    
    print("📝 Регистрация обработчиков...")
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("payment", payment))
    application.add_handler(CommandHandler("more_info", more_info))
    application.add_handler(CommandHandler("cancel", cancel_reply))
    application.add_handler(CommandHandler("messages", admin_messages))
    application.add_handler(CommandHandler("check_expired", check_expired_subscriptions))
    
    # Регистрируем обработчики кнопок и сообщений
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(ChatMemberHandler(channel_manager.handle_chat_member_update))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    
    print("✅ Обработчики зарегистрированы")
    
    # Настраиваем webhook URL для Railway
    webhook_url = os.getenv('RAILWAY_STATIC_URL', '')
    if webhook_url:
        print(f"🌐 Настройка webhook: {webhook_url}/webhook")
        # Устанавливаем webhook URL через requests (синхронно)
        webhook_setup_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
        webhook_data = {
            "url": f"{webhook_url}/webhook",
            "secret_token": os.getenv('WEBHOOK_SECRET', 'telegram_webhook_secret_2024')
        }
        
        try:
            response = requests.post(webhook_setup_url, json=webhook_data)
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
    
    # Запускаем автоматическую проверку подписок и платежей
    import threading
    import time
    
    def subscription_checker():
        while True:
            try:
                check_and_remove_expired_subscriptions()
                time.sleep(6 * 60 * 60)  # 6 часов
            except Exception as e:
                print(f"❌ Ошибка в проверке подписок: {e}")
                time.sleep(60)  # 1 минута при ошибке
    
    def payment_checker():
        while True:
            try:
                check_pending_payments()
                time.sleep(30)  # Проверяем каждые 30 секунд
            except Exception as e:
                print(f"❌ Ошибка в проверке платежей: {e}")
                time.sleep(60)  # 1 минута при ошибке
    
    # Запускаем проверку подписок в отдельном потоке
    subscription_thread = threading.Thread(target=subscription_checker, daemon=True)
    subscription_thread.start()
    print("🔄 Автоматическая проверка подписок запущена")
    
    # Запускаем проверку платежей в отдельном потоке
    payment_thread = threading.Thread(target=payment_checker, daemon=True)
    payment_thread.start()
    print("🔄 Автоматическая проверка платежей запущена")
    
    print("🚀 Запуск Flask приложения...")
    # Запускаем Flask приложение
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
