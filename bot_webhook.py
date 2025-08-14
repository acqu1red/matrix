#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment - LAVA TOP API v2
"""

import os
import hmac
import hashlib
import json
import time
import base64
from datetime import datetime
import aiohttp
import requests
from flask import Flask, request, jsonify

# для телеграма
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from telegram.constants import ParseMode

# === TELEGRAM CONFIG ===
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()]

# === LAVA TOP API CONFIG ===
LAVA_TOP_API_BASE = os.getenv("LAVA_TOP_API_BASE", "https://gate.lava.top")
LAVA_TOP_API_KEY = os.getenv("LAVA_TOP_API_KEY", "")
LAVA_TOP_WEBHOOK_SECRET = os.getenv("LAVA_TOP_WEBHOOK_SECRET", "")

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

# === BASE URL ===
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "https://formulaprivate-productionpaymentuknow.up.railway.app")

# Flask app
app = Flask(__name__)

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

# Flask endpoints
@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/webhook", methods=["GET", "POST"])
def telegram_webhook():
    """Telegram webhook endpoint"""
    if request.method == "GET":
        # Автоматическое исправление webhook при GET запросе
        try:
            webhook_url = f"{PUBLIC_BASE_URL}/webhook"
            webhook_data = {
                "url": webhook_url,
                "secret_token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c",
                "max_connections": 40,
                "allowed_updates": ["message", "callback_query"]
            }
            
            # Удаляем старый webhook
            delete_response = requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
            )
            print(f"🗑️ Удаление старого webhook: {delete_response.status_code} - {delete_response.text}")
            
            # Устанавливаем новый webhook
            set_response = requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                json=webhook_data
            )
            print(f"📡 Ответ установки webhook: {set_response.status_code} - {set_response.text}")
            
            return jsonify({"status": "webhook_updated", "url": webhook_url})
        except Exception as e:
            print(f"❌ Ошибка обновления webhook: {e}")
            return jsonify({"error": str(e)}), 500
    
    # POST - обработка Telegram updates
    try:
        update_data = request.get_json(force=True, silent=False)
        print(f"📱 Получен Telegram update: {update_data}")
        
        # Передаем update в Telegram application
        application = app.config.get("telegram_application")
        if application:
            application.create_task(application.process_update(Update.de_json(update_data, application.bot)))
        
        return "ok"
    except Exception as e:
        print(f"❌ Ошибка обработки Telegram update: {e}")
        return "error", 500

@app.route("/api/create-payment", methods=["POST"])
async def create_payment_api():
    """
    Принимает JSON из MiniApp:
    {
      "user_id": <int>,      // Telegram user id
      "chat_id": <int>,      // chat.id пользователя (если есть)
      "email": "mail@...",
      "tariff": "basic",
      "price": 500,
      "bank": "russian"
    }
    Возвращает { ok: true, payment_url: "..." }
    """
    try:
        data = request.get_json(force=True, silent=False)
        print(f"📋 Получены данные для создания платежа: {data}")
    except Exception:
        return jsonify({"ok": False, "error": "Invalid JSON"}), 400

    user_id = int(data.get("user_id") or 0)
    chat_id = int(data.get("chat_id") or user_id)
    email = (data.get("email") or "").strip()
    tariff = (data.get("tariff") or "").strip()
    price = int(data.get("price") or 0)
    bank = (data.get("bank") or "russian").strip()

    if not user_id or not price or not email:
        return jsonify({"ok": False, "error": "user_id, price and email are required"}), 400

    try:
        # Создаем инвойс через LAVA TOP API v2
        pay_url = await create_lava_top_invoice(
            email=email, 
            tariff=tariff, 
            price=price, 
            bank=bank, 
            user_id=user_id, 
            chat_id=chat_id
        )
        print(f"✅ Создан платеж: {pay_url}")
        return jsonify({"ok": True, "payment_url": pay_url})
    except Exception as e:
        print(f"[create-payment] ERROR: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/lava-webhook", methods=["GET", "POST"])
def lava_webhook():
    """
    Приём вебхука от LAVA TOP API v2
    """
    if request.method == "GET":
        return "Lava TOP webhook endpoint is working"
    
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception:
        return "bad json", 400

    print(f"[lava-webhook] incoming: {payload}")

    # Проверяем подпись если задан секрет
    if LAVA_TOP_WEBHOOK_SECRET:
        try:
            signature = request.headers.get("X-Signature")
            if signature:
                # Вычисляем HMAC-SHA256
                body = request.get_data()
                expected_signature = hmac.new(
                    LAVA_TOP_WEBHOOK_SECRET.encode('utf-8'),
                    body,
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(signature, expected_signature):
                    print("[lava-webhook] signature mismatch")
                    return "signature mismatch", 400
        except Exception as e:
            print(f"[lava-webhook] signature check error: {e}")

    # Обрабатываем событие успешной оплаты
    event_type = payload.get("eventType", "").lower()
    if event_type in ("payment.success", "invoice.paid", "success"):
        try:
            # Извлекаем user_id и chat_id из metadata
            metadata = payload.get("data", {}).get("metadata", {})
            user_id = int(metadata.get("user_id", 0))
            chat_id = int(metadata.get("chat_id", 0))
            
            if user_id:
                # Отправляем приглашение пользователю
                application = app.config.get("telegram_application")
                if application:
                    application.create_task(_send_invite_on_success(application, user_id, chat_id))
                    print(f"[lava-webhook] Scheduled invite for user {user_id}")
                else:
                    print("[lava-webhook] No telegram application available")
            else:
                print("[lava-webhook] No user_id in metadata")
                
        except Exception as e:
            print(f"[lava-webhook] Error processing success: {e}")

    return "ok", 200

@app.route("/webhook-info")
def webhook_info():
    """Проверка статуса webhook"""
    try:
        response = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo")
        webhook_info = response.json()
        print(f"📋 Информация о webhook: {webhook_info}")
        
        if webhook_info.get("ok"):
            result = webhook_info.get("result", {})
            current_url = result.get("url", "")
            expected_url = f"{PUBLIC_BASE_URL}/webhook"
            
            print(f"🔍 Фактический webhook URL: {current_url}")
            print(f"🔍 Ожидаемый webhook URL: {expected_url}")
            
            if current_url == expected_url:
                print("✅ Webhook URL установлен правильно!")
                return jsonify({"status": "ok", "webhook_info": webhook_info})
            else:
                print("❌ Webhook URL неверный, исправляем...")
                # Автоматическое исправление
                webhook_data = {
                    "url": expected_url,
                    "secret_token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c",
                    "max_connections": 40,
                    "allowed_updates": ["message", "callback_query"]
                }
                
                set_response = requests.post(
                    f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                    json=webhook_data
                )
                print(f"📡 Ответ исправления webhook: {set_response.status_code} - {set_response.text}")
                
                return jsonify({"status": "fixed", "webhook_info": webhook_info})
        else:
            return jsonify({"status": "error", "webhook_info": webhook_info})
            
    except Exception as e:
        print(f"❌ Ошибка получения информации о webhook: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reset-webhook", methods=["GET", "POST"])
def reset_webhook():
    """Сброс и переустановка webhook"""
    try:
        webhook_url = f"{PUBLIC_BASE_URL}/webhook"
        webhook_data = {
            "url": webhook_url,
            "secret_token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c",
            "max_connections": 40,
            "allowed_updates": ["message", "callback_query"]
        }
        
        # Удаляем старый webhook
        delete_response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
        )
        print(f"🗑️ Удаление старого webhook: {delete_response.status_code} - {delete_response.text}")
        
        # Устанавливаем новый webhook
        set_response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
            json=webhook_data
        )
        print(f"📡 Ответ установки webhook: {set_response.status_code} - {set_response.text}")
        
        if set_response.status_code == 200:
            print("✅ Webhook успешно установлен")
            return jsonify({"status": "success", "url": webhook_url})
        else:
            print("❌ Ошибка установки webhook")
            return jsonify({"status": "error", "response": set_response.text}), 500
            
    except Exception as e:
        print(f"❌ Ошибка сброса webhook: {e}")
        return jsonify({"error": str(e)}), 500

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
        [InlineKeyboardButton("💳 Оплатить подписку", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))]
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

async def payment_menu(update: Update, context):
    """Меню оплаты"""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 Оплатить подписку", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))]
    ])
    
    text = (
        "💳 <b>Оформление подписки</b>\n\n"
        "Нажмите кнопку ниже, чтобы перейти к оформлению подписки."
    )
    
    await update.message.reply_text(text, reply_markup=keyboard, parse_mode=ParseMode.HTML)

async def button(update: Update, context):
    """Обработчик inline кнопок"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "payment":
        await payment_menu(update, context)

def main():
    """Основная функция запуска бота"""
    print("🚀 Запуск Flask приложения...")
    
    # Создаем Telegram application
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Сохраняем application в Flask app для доступа из webhook
    app.config["telegram_application"] = application
    
    print("🚀 Запуск бота с webhook...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_TOP_API_KEY: {LAVA_TOP_API_KEY[:20] if LAVA_TOP_API_KEY else 'NOT SET'}...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    print(f"📦 Offer IDs: {OFFER_MAP}")
    
    # Регистрируем обработчики
    print("📝 Регистрация обработчиков...")
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("payment", payment_menu))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    application.add_handler(CallbackQueryHandler(button))
    print("✅ Обработчики зарегистрированы")
    
    # Настройка Mini Apps
    print("🔧 Настройка Mini Apps...")
    try:
        application.bot.set_my_commands([
            ("start", "Запустить бота"),
            ("payment", "Оформить подписку")
        ])
        print("✅ Команды бота настроены")
    except Exception as e:
        print(f"❌ Ошибка настройки команд: {e}")
    
    # Настройка webhook
    webhook_url = f"{PUBLIC_BASE_URL}/webhook"
    print(f"🌐 Настройка webhook: {webhook_url}")
    
    webhook_data = {
        "url": webhook_url,
        "secret_token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c",
        "max_connections": 40,
        "allowed_updates": ["message", "callback_query"]
    }
        
    print(f"🔧 Webhook данные: {webhook_data}")
        
    try:
        # Удаляем старый webhook
        delete_response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
        )
        print(f"🗑️ Удаление старого webhook: {delete_response.status_code} - {delete_response.text}")
            
        # Устанавливаем новый webhook
        set_response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
            json=webhook_data
        )
        print(f"📡 Ответ установки webhook: {set_response.status_code} - {set_response.text}")
        
        if set_response.status_code == 200:
            print("✅ Webhook успешно установлен")
        else:
            print("❌ Ошибка установки webhook")
            
    except Exception as e:
        print(f"❌ Ошибка настройки webhook: {e}")
    
    # Запускаем Flask app
    print("🚀 Запуск Flask приложения...")
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8080)), debug=False)

if __name__ == "__main__":
    main()
