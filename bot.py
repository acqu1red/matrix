#!/usr/bin/env python3
"""
Telegram Bot with polling for local development - LAVA TOP API v2 + Support
"""

import os
import json
import time
import aiohttp
import base64
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from telegram.constants import ParseMode
from supabase import create_client, Client

# === TELEGRAM CONFIG ===
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "708907063,7365307696").split(",") if x.strip()]

# === LAVA TOP API CONFIG ===
LAVA_TOP_API_BASE = os.getenv("LAVA_TOP_API_BASE", "https://gate.lava.top")
LAVA_TOP_API_KEY = os.getenv("LAVA_TOP_API_KEY", "whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav")

# === OFFER IDs ===
OFFER_MAP = {
    "basic": os.getenv("LAVA_OFFER_ID_BASIC", ""),
    "pro": os.getenv("LAVA_OFFER_ID_PRO", ""),
    "vip": os.getenv("LAVA_OFFER_ID_VIP", ""),
    "1_month": os.getenv("LAVA_OFFER_ID_BASIC", ""),  # для совместимости
}

# === CHANNEL/INVITES ===
PRIVATE_CHANNEL_ID = int(os.getenv("PRIVATE_CHANNEL_ID", "-1001234567890"))

# === MINI APPS ===
PAYMENT_MINIAPP_URL = os.getenv("PAYMENT_MINIAPP_URL", "https://acqu1red.github.io/formulaprivate/payment.html")
MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/?type=support"

# === SUPABASE CONFIG ===
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://uhhsrtmmuwoxsdquimaa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Список username администраторов
ADMIN_USERNAMES = [
    "acqu1red",
    "cashm3thod",
]

def _method_by_bank_and_currency(bank: str, currency: str) -> str:
    """Определяет метод оплаты по банку и валюте"""
    bank = (bank or "russian").lower()
    currency = (currency or "RUB").upper()
    if currency == "RUB":
        return "BANK131"
    # для заграничных валют - подставь подходящее из доступных
    return "UNLIMINT"  # либо PAYPAL/STRIPE, если включены в кабинете

async def create_lava_top_invoice(*, email: str, tariff: str, price: int,
                                  bank: str, currency: str = "RUB", user_id: int = 0, chat_id: int = 0) -> str:
    """Создает инвойс через LAVA TOP API v2"""
    assert LAVA_TOP_API_KEY, "LAVA_TOP_API_KEY is required"
    
    # Определяем offerId по тарифу
    offer_id = OFFER_MAP.get((tariff or "basic").lower())
    if not offer_id:
        raise RuntimeError(f"No offerId for tariff={tariff}")

    url = f"{LAVA_TOP_API_BASE.rstrip('/')}/api/v2/invoice"
    headers = {
        "X-Api-Key": LAVA_TOP_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    
    # Метаданные для передачи user_id и chat_id
    metadata = {}
    if user_id:
        metadata["user_id"] = str(user_id)
    if chat_id:
        metadata["chat_id"] = str(chat_id)
    
    payload = {
        "email": email,
        "offerId": offer_id,
        "currency": currency,
        "paymentMethod": _method_by_bank_and_currency(bank, currency),
        "buyerLanguage": "RU"
    }
    
    # Добавляем metadata если есть
    if metadata:
        payload["metadata"] = metadata
    
    async with aiohttp.ClientSession() as s:
        async with s.post(url, headers=headers, json=payload) as r:
            txt = await r.text()
            if r.status != 200:
                raise RuntimeError(f"Lava TOP {r.status}: {txt}")
            data = json.loads(txt)
            
            # Ищем ссылку оплаты в ответе
            pay_url = next((data.get(k) for k in ("payUrl","invoiceUrl","paymentUrl","url","link") if data.get(k)), None)
            if not pay_url:
                raise RuntimeError(f"No payment URL in response: {data}")
            return pay_url

async def _send_invite_on_success(application: Application, user_id: int, chat_id: int) -> None:
    """Отправляет пригласительную ссылку пользователю после успешной оплаты"""
    try:
        # Создаём одноразовую ссылку на 1 использование, живёт 1 день
        expire_date = int(time.time()) + 86400
        invite = await application.bot.create_chat_invite_link(
            chat_id=PRIVATE_CHANNEL_ID,
            name=f"paid_{user_id}_{int(time.time())}",
            expire_date=expire_date,
            member_limit=1,
            creates_join_request=False
        )

        text = (
            "✅ Оплата успешно получена!\n\n"
            f"Вот ваша ссылка-приглашение в закрытый канал:\n{invite.invite_link}\n\n"
            "Если ссылка не открывается, напишите сюда — мы поможем."
        )
        
        await application.bot.send_message(chat_id=chat_id or user_id, text=text)
        print(f"[_send_invite_on_success] Invite sent to {chat_id or user_id}")
        
    except Exception as e:
        print(f"[_send_invite_on_success] Failed to send invite to {chat_id or user_id}: {e}")

# === SUPABASE FUNCTIONS ===

async def save_message_to_db(user, message):
    """Сохраняет сообщение в базе данных"""
    try:
        # Создаем или получаем пользователя
        user_data = {
            'telegram_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        
        # Вставляем или обновляем пользователя
        result = supabase.table('users').upsert(user_data).execute()
        
        # Получаем или создаем диалог
        conversation_result = supabase.table('conversations').select('id').eq('user_id', user.id).execute()
        
        if conversation_result.data:
            conversation_id = conversation_result.data[0]['id']
        else:
            # Создаем новый диалог
            conversation_data = {
                'user_id': user.id,
                'status': 'open'
            }
            conversation_result = supabase.table('conversations').insert(conversation_data).execute()
            conversation_id = conversation_result.data[0]['id']
        
        # Определяем тип сообщения
        message_type = 'text'
        content = message.text or ''
        
        if message.photo:
            message_type = 'image'
            content = message.caption or '[Фото]'
        elif message.video:
            message_type = 'video'
            content = message.caption or '[Видео]'
        elif message.voice:
            message_type = 'voice'
            content = '[Голосовое сообщение]'
        elif message.document:
            message_type = 'file'
            content = f'[Документ] {message.document.file_name or "Без названия"}'
        elif message.sticker:
            message_type = 'sticker'
            content = f'[Стикер] {message.sticker.emoji or "Без эмодзи"}'
        elif message.audio:
            message_type = 'audio'
            content = f'[Аудио] {message.audio.title or "Без названия"}'
        
        # Сохраняем сообщение
        message_data = {
            'conversation_id': conversation_id,
            'sender_id': user.id,
            'content': content,
            'message_type': message_type
        }
        
        supabase.table('messages').insert(message_data).execute()
        
    except Exception as e:
        print(f"Ошибка сохранения в БД: {e}")
        raise e

# Telegram bot handlers
async def start_command(update: Update, context):
    """Обработчик команды /start"""
    user = update.effective_user
    chat_id = update.effective_chat.id
    
    print(f"👋 Пользователь {user.id} ({user.username}) запустил бота в чате {chat_id}")
    
    welcome_text = (
        f"👋 Привет, {user.first_name}!\n\n"
        "Добро пожаловать в Formula Private Channel!\n\n"
        "Для получения доступа к закрытому каналу необходимо оформить подписку."
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 Оплатить подписку", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))],
        [InlineKeyboardButton("💻 Поддержка", web_app=WebAppInfo(url=MINIAPP_URL))]
    ])
    
    await update.message.reply_text(welcome_text, reply_markup=keyboard)

async def handle_web_app_data(update: Update, context):
    """Обработчик данных из Mini App"""
    try:
        if not update.message or not update.message.web_app_data:
            return
            
        user = update.effective_user
        chat_id = update.effective_chat.id
        
        print(f"📱 Получены данные от Mini App от пользователя {user.id}")
        
        # Декодируем данные из Mini App (они приходят в base64)
        raw_data = update.message.web_app_data.data
        try:
            decoded_data = base64.b64decode(raw_data).decode('utf-8')
            payment_data = json.loads(decoded_data)
            print(f"📱 Декодированные данные (base64): {payment_data}")
        except Exception as decode_error:
            print(f"📱 Ошибка base64 декодирования: {decode_error}")
            # Fallback: пробуем парсить как обычный JSON
            try:
                payment_data = json.loads(raw_data)
                print(f"📱 Данные (прямой JSON): {payment_data}")
            except Exception as json_error:
                print(f"📱 Ошибка JSON парсинга: {json_error}")
                await update.message.reply_text("❌ Ошибка обработки данных. Попробуйте еще раз.")
                return
            
        # Извлекаем данные из payment_data
        if isinstance(payment_data, dict):
            # Если данные пришли в формате {step: "final_data", data: {...}}
            if "step" in payment_data and payment_data["step"] == "final_data":
                final_data = payment_data.get("data", {})
                email = final_data.get("email", "")
                tariff = final_data.get("tariff", "basic")
                price = int(final_data.get("price", 50))
                bank = final_data.get("bank", "russian")
            else:
                # Прямой формат данных
                email = payment_data.get("email", "")
                tariff = payment_data.get("tariff", "basic")
                price = int(payment_data.get("price", 50))
                bank = payment_data.get("bank", "russian")
        else:
            await update.message.reply_text("❌ Неверный формат данных. Попробуйте еще раз.")
            return
            
        print(f"📋 Обработанные данные: email={email}, tariff={tariff}, price={price}, bank={bank}")
        
        # Создаем платеж через LAVA TOP API v2
        try:
            pay_url = await create_lava_top_invoice(
                email=email, 
                tariff=tariff, 
                price=price, 
                bank=bank, 
                user_id=user.id, 
                chat_id=chat_id
            )
            
            text = (
                "✅ <b>Заявка принята!</b>\n\n"
                "Нажмите кнопку, чтобы перейти к оплате. После успешной оплаты доступ придёт автоматически."
            )
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton("💳 Оплатить (LAVA TOP)", url=pay_url)]
            ])
            await update.message.reply_text(text, reply_markup=kb, parse_mode=ParseMode.HTML)
                
        except Exception as e:
            print(f"❌ Ошибка создания платежа: {e}")
            await update.message.reply_text(
                "❌ Не удалось создать платёж. Попробуйте ещё раз или напишите в поддержку."
            )
            # Лог админам
            for admin in ADMIN_IDS:
                try:
                    await context.bot.send_message(admin, f"❌ Ошибка создания инвойса: {e}")
                except:
                    pass
    
    except Exception as e:
        print(f"❌ Общая ошибка в handle_web_app_data: {e}")
        await update.message.reply_text("❌ Произошла ошибка. Попробуйте еще раз.")

async def handle_all_messages(update: Update, context) -> None:
    """Обрабатывает все сообщения - уведомления администраторов и ответы от них"""
    print("🎯 Функция handle_all_messages вызвана!")
    
    # Проверяем, является ли это данными от miniapp
    if update.message and update.message.web_app_data:
        await handle_web_app_data(update, context)
        return
    
    user = update.effective_user
    message = update.effective_message
    
    # Определяем тип сообщения для отладки
    message_type = "текст"
    if message.photo:
        message_type = "фото"
    elif message.video:
        message_type = "видео"
    elif message.voice:
        message_type = "голосовое"
    elif message.document:
        message_type = "документ"
    elif message.sticker:
        message_type = "стикер"
    elif message.audio:
        message_type = "аудио"
    
    print(f"🔍 Получено {message_type} сообщение от пользователя {user.id} ({user.first_name}): {message.text or '[медиа]'}")
    
    # Если это администратор и он в режиме ответа
    if (user.id in ADMIN_IDS or (user.username and user.username in ADMIN_USERNAMES)) and context.user_data.get('waiting_for_reply') and context.user_data.get('replying_to'):
        print(f"👨‍💼 Администратор {user.id} отправляет ответ пользователю {context.user_data['replying_to']}")
        target_user_id = context.user_data['replying_to']
        
        try:
            # Отправляем ответ пользователю
            await context.bot.send_message(
                chat_id=target_user_id,
                text=f"💬 <b>Ответ от администратора:</b>\n\n{message.text}",
                parse_mode='HTML'
            )
            
            # Подтверждаем отправку администратору
            await update.effective_message.reply_text(
                f"✅ <b>Ответ отправлен пользователю {target_user_id}</b>",
                parse_mode='HTML'
            )
            
            # Очищаем состояние
            context.user_data.pop('waiting_for_reply', None)
            context.user_data.pop('replying_to', None)
            
        except Exception as e:
            await update.effective_message.reply_text(
                f"❌ <b>Ошибка отправки ответа:</b> {str(e)}",
                parse_mode='HTML'
            )
        return
    
    # Сохраняем сообщение в базе данных
    try:
        await save_message_to_db(user, message)
        print(f"💾 Сообщение сохранено в БД для пользователя {user.id}")
    except Exception as e:
        print(f"❌ Ошибка сохранения сообщения в БД: {e}")
    
    # Если это обычный пользователь (не администратор), отправляем уведомление администраторам
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        print(f"📨 Отправляем уведомление администраторам о сообщении от пользователя {user.id}")
        
        # Формируем информацию о пользователе
        user_info = f"👤 <b>Пользователь:</b>\n"
        user_info += f"ID: {user.id}\n"
        user_info += f"Имя: {user.first_name or 'Не указано'}\n"
        user_info += f"Фамилия: {user.last_name or 'Не указана'}\n"
        user_info += f"Username: @{user.username or 'Не указан'}\n"
        
        # Определяем тип сообщения
        message_type = "Текст"
        message_content = message.text or ""
        
        if message.photo:
            message_type = "Фото"
            message_content = f"[Фото] {message.caption or 'Без подписи'}"
        elif message.video:
            message_type = "Видео"
            message_content = f"[Видео] {message.caption or 'Без подписи'}"
        elif message.voice:
            message_type = "Голосовое сообщение"
            message_content = "[Голосовое сообщение]"
        elif message.document:
            message_type = "Документ"
            message_content = f"[Документ] {message.document.file_name or 'Без названия'}"
        elif message.sticker:
            message_type = "Стикер"
            message_content = f"[Стикер] {message.sticker.emoji or 'Без эмодзи'}"
        elif message.audio:
            message_type = "Аудио"
            message_content = f"[Аудио] {message.audio.title or 'Без названия'}"
        
        # Формируем текст сообщения
        message_text = f"📨 <b>Новое сообщение от пользователя!</b>\n\n{user_info}\n"
        message_text += f"💬 <b>Тип сообщения:</b> {message_type}\n"
        message_text += f"💬 <b>Содержание:</b>\n{message_content}\n\n"
        message_text += f"⚠️ <b>Требуется ответ!</b>"
        
        # Создаем инлайн-кнопку для ответа
        keyboard = [
            [InlineKeyboardButton("Ответить долбаебу", callback_data=f'reply_to_{user.id}')]
        ]
        markup = InlineKeyboardMarkup(keyboard)
        
        # Отправляем уведомление всем администраторам по username
        for admin_username in ADMIN_USERNAMES:
            try:
                print(f"📤 Отправляем уведомление администратору @{admin_username}")
                await context.bot.send_message(
                    chat_id=f"@{admin_username}",
                    text=message_text,
                    parse_mode='HTML',
                    reply_markup=markup
                )
                print(f"✅ Уведомление успешно отправлено администратору @{admin_username}")
            except Exception as e:
                print(f"❌ Ошибка отправки уведомления администратору @{admin_username}: {e}")
                # Попробуем отправить без @
                try:
                    print(f"📤 Пробуем отправить без @ администратору {admin_username}")
                    await context.bot.send_message(
                        chat_id=admin_username,
                        text=message_text,
                        parse_mode='HTML',
                        reply_markup=markup
                    )
                    print(f"✅ Уведомление успешно отправлено администратору {admin_username}")
                except Exception as e2:
                    print(f"❌ Ошибка отправки уведомления администратору {admin_username}: {e2}")
    else:
        print(f"👨‍💼 Сообщение от администратора {user.id} - уведомления не отправляем")

async def payment_menu(update: Update, context):
    """Меню оплаты"""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 Оплатить подписку", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))],
        [InlineKeyboardButton("💻 Поддержка", web_app=WebAppInfo(url=MINIAPP_URL))]
    ])
    
    text = (
        "💳 <b>Оформление подписки</b>\n\n"
        "Нажмите кнопку ниже, чтобы перейти к оформлению подписки."
    )
    
    await update.message.reply_text(text, reply_markup=keyboard, parse_mode=ParseMode.HTML)

async def cancel_reply(update: Update, context) -> None:
    """Отменяет режим ответа администратора"""
    user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        return
    
    # Очищаем состояние
    context.user_data.pop('waiting_for_reply', None)
    context.user_data.pop('replying_to', None)
    
    await update.effective_message.reply_text(
        "❌ <b>Режим ответа отменен</b>",
        parse_mode='HTML'
    )

async def admin_messages(update: Update, context) -> None:
    """Показывает администратору новые сообщения от пользователей"""
    user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.effective_message.reply_text(
            "❌ <b>У вас нет прав для выполнения этого действия!</b>",
            parse_mode='HTML'
        )
        return
    
    try:
        # Получаем последние диалоги с сообщениями
        result = supabase.rpc('get_admin_conversations').execute()
        
        if not result.data:
            await update.effective_message.reply_text(
                "📭 <b>Новых сообщений нет</b>",
                parse_mode='HTML'
            )
            return
        
        # Формируем список диалогов
        conversations_text = "📨 <b>Последние сообщения от пользователей:</b>\n\n"
        
        for i, conv in enumerate(result.data[:10], 1):  # Показываем первые 10
            user_name = conv.get('username', f'Пользователь #{conv["user_id"]}')
            last_message = conv.get('last_message', 'Нет сообщений')[:50] + '...' if len(conv.get('last_message', '')) > 50 else conv.get('last_message', 'Нет сообщений')
            message_count = conv.get('message_count', 0)
            
            conversations_text += f"{i}. <b>{user_name}</b> (ID: {conv['user_id']})\n"
            conversations_text += f"   💬 {last_message}\n"
            conversations_text += f"   📊 Сообщений: {message_count}\n\n"
        
        # Создаем кнопки для ответа
        keyboard = []
        for i, conv in enumerate(result.data[:5], 1):  # Кнопки для первых 5
            keyboard.append([InlineKeyboardButton(f"Ответить {i}", callback_data=f'admin_reply_{conv["user_id"]}')])
        
        keyboard.append([InlineKeyboardButton("🔄 Обновить", callback_data='admin_refresh')])
        
        markup = InlineKeyboardMarkup(keyboard)
        
        await update.effective_message.reply_text(
            conversations_text,
            parse_mode='HTML',
            reply_markup=markup
        )
        
    except Exception as e:
        print(f"Ошибка получения сообщений: {e}")
        await update.effective_message.reply_text(
            f"❌ <b>Ошибка получения сообщений:</b> {str(e)}",
            parse_mode='HTML'
        )

async def handle_admin_reply(update: Update, context, user_id: str) -> None:
    """Обрабатывает нажатие кнопки 'Ответить долбаебу' администратором"""
    query = update.callback_query
    admin_user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if admin_user.id not in ADMIN_IDS and (admin_user.username is None or admin_user.username not in ADMIN_USERNAMES):
        await query.answer("У вас нет прав для выполнения этого действия!")
        return
    
    # Сохраняем информацию о том, что администратор хочет ответить пользователю
    context.user_data['replying_to'] = user_id
    
    # Отправляем сообщение администратору с инструкциями
    reply_text = f"💬 <b>Ответ пользователю {user_id}</b>\n\n"
    reply_text += "Напишите ваш ответ. Он будет отправлен пользователю.\n"
    reply_text += "Для отмены напишите /cancel"
    
    await query.edit_message_text(text=reply_text, parse_mode='HTML')
    
    # Устанавливаем состояние ожидания ответа администратора
    context.user_data['waiting_for_reply'] = True

async def button(update: Update, context):
    """Обработчик inline кнопок"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "payment":
        await payment_menu(update, context)
    elif query.data.startswith('reply_to_'):
        # Обработка кнопки "Ответить долбаебу"
        user_id = query.data.split('_')[2]  # Получаем ID пользователя
        await handle_admin_reply(update, context, user_id)
    elif query.data.startswith('admin_reply_'):
        # Обработка кнопки "Ответить" из админ-панели
        user_id = query.data.split('_')[2]  # Получаем ID пользователя
        await handle_admin_reply(update, context, user_id)
    elif query.data == 'admin_refresh':
        # Обновление списка сообщений
        await admin_messages(update, context)

def main():
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с polling...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_TOP_API_KEY: {LAVA_TOP_API_KEY[:20] if LAVA_TOP_API_KEY else 'NOT SET'}...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    print(f"👥 Администраторы по username: {ADMIN_USERNAMES}")
    print(f"📦 Offer IDs: {OFFER_MAP}")
    
    # Создаем Telegram application
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Регистрируем обработчики
    print("📝 Регистрация обработчиков...")
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("payment", payment_menu))
    application.add_handler(CommandHandler("cancel", cancel_reply))
    application.add_handler(CommandHandler("messages", admin_messages))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    application.add_handler(CallbackQueryHandler(button))
    print("✅ Обработчики зарегистрированы")
    
    # Настройка Mini Apps
    print("🔧 Настройка Mini Apps...")
    try:
        application.bot.set_my_commands([
            ("start", "Запустить бота"),
            ("payment", "Оформить подписку"),
            ("messages", "Сообщения пользователей")
        ])
        print("✅ Команды бота настроены")
    except Exception as e:
        print(f"❌ Ошибка настройки команд: {e}")

    print("🔄 Запуск polling...")
    application.run_polling()

if __name__ == "__main__":
    main()
