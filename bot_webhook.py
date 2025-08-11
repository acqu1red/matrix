#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment
"""

import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, CallbackContext, ChatMemberHandler
from datetime import datetime, timedelta
import requests
from supabase import create_client, Client
from channel_manager import ChannelManager
from telegram.web_app import WebAppInfo

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
ADMIN_IDS = [708907063, 7365307696]
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
        [InlineKeyboardButton("💳 Оплатить через Lava Top", web_app=WebAppInfo(url="https://your-payment-url.com"))],
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

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с webhook...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    print(f"👥 Администраторы по username: {ADMIN_USERNAMES}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
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
    
    # Настраиваем webhook
    if WEBHOOK_URL:
        print(f"🌐 Настройка webhook: {WEBHOOK_URL}{WEBHOOK_PATH}")
        application.run_webhook(
            listen="0.0.0.0",
            port=int(os.getenv('PORT', 8080)),
            webhook_url=f"{WEBHOOK_URL}{WEBHOOK_PATH}",
            secret_token=os.getenv('WEBHOOK_SECRET', 'your_webhook_secret')
        )
    else:
        print("🔄 Запуск в режиме polling...")
        application.run_polling()

if __name__ == '__main__':
    main()
