#!/usr/bin/env python3
"""
Telegram Bot with Lava API integration for Railway deployment
"""

import os
import hmac
import hashlib
import json
import time
import base64
import asyncio
import requests
import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from supabase import create_client, Client

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Конфигурация
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
ADMIN_IDS = [708907063, 7365307696]

# Supabase конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://uhhsrtmmuwoxsdquimaa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === LAVA API CONFIG ===
LAVA_API_BASE = os.getenv("LAVA_API_BASE", "https://api.lava.ru/business")
LAVA_API_KEY = os.getenv("LAVA_API_KEY", "whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav")
LAVA_SHOP_ID = os.getenv("LAVA_SHOP_ID", "1b9f3e05-86aa-4102-9648-268f0f586bb1")
LAVA_SUCCESS_URL = os.getenv("LAVA_SUCCESS_URL", "https://t.me/FormulaPrivateBot")
LAVA_FAIL_URL = os.getenv("LAVA_FAIL_URL", "https://t.me/FormulaPrivateBot")

# Хук, на который LAVA пришлет статус:
PUBLIC_BASE_URL = os.getenv("RAILWAY_STATIC_URL") or os.getenv("PUBLIC_BASE_URL") or "https://formulaprivate-productionpaymentuknow.up.railway.app"
HOOK_URL = f"{PUBLIC_BASE_URL}/lava-webhook" if PUBLIC_BASE_URL else ""

# === CHANNEL/INVITES ===
TARGET_CHANNEL_ID = int(os.getenv("TARGET_CHANNEL_ID", "-1002717275103"))  # например: -1001234567890
STATIC_INVITE_LINK = os.getenv("STATIC_INVITE_LINK")  # если не задано, создаём одноразовую ссылку

# Создаем Flask приложение
app = Flask(__name__)

# Для подписи запросов (часть интеграций LAVA требует HMAC; оставляем гибко)
def _lava_signature(body: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()

def _lava_headers(body: str) -> dict:
    # Используем только Bearer авторизацию, без подписи
    return {
        "Authorization": f"Bearer {LAVA_API_KEY}",
        "Content-Type": "application/json",
    }

def lava_post(path: str, payload: dict) -> dict:
    url = f"{LAVA_API_BASE.rstrip('/')}/{path.lstrip('/')}"
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    headers = _lava_headers(body)
    print(f"🔧 Lava API POST: {url}")
    print(f"📋 Headers: {headers}")
    print(f"📋 Payload: {body}")
    resp = requests.post(url, data=body.encode("utf-8"), headers=headers, timeout=20)
    print(f"📡 Response: {resp.status_code} - {resp.text}")
    try:
        data = resp.json()
    except Exception:
        raise RuntimeError(f"Lava API non-JSON response: {resp.status_code} {resp.text[:200]}")
    if resp.status_code >= 300:
        raise RuntimeError(f"Lava API error {resp.status_code}: {data}")
    return data

def lava_get(path: str, params: dict) -> dict:
    url = f"{LAVA_API_BASE.rstrip('/')}/{path.lstrip('/')}"
    headers = {"Authorization": f"Bearer {LAVA_API_KEY}"}
    print(f"🔧 Lava API GET: {url}")
    print(f"📋 Params: {params}")
    resp = requests.get(url, params=params, headers=headers, timeout=20)
    print(f"📡 Response: {resp.status_code} - {resp.text}")
    try:
        data = resp.json()
    except Exception:
        raise RuntimeError(f"Lava API non-JSON response: {resp.status_code} {resp.text[:200]}")
    if resp.status_code >= 300:
        raise RuntimeError(f"Lava API error {resp.status_code}: {data}")
    return data

def create_lava_invoice_api(user_id: int, chat_id: int, email: str, tariff: str, price_rub: int) -> str:
    """
    Создаёт инвойс через LAVA Business API и возвращает payUrl.
    orderId прошиваем user_id и chat_id, чтобы не терять связь.
    """
    if not (LAVA_API_KEY and LAVA_SHOP_ID):
        raise RuntimeError("LAVA_API_KEY/LAVA_SHOP_ID are not set")

    # Уникальный orderId: содержит и user_id, и chat_id для обратной связи
    ts = int(time.time())
    order_id = f"order_{user_id}_{chat_id}_{ts}"

    # Валюта и сумма — подстрой под свой кейс
    payload = {
        "shopId": str(LAVA_SHOP_ID),
        "orderId": order_id,
        "sum": int(price_rub),         # целое число в копейках/рублях — зависит от API; чаще рубли целым
        "currency": "RUB",
        "comment": f"Tariff: {tariff}",
        "hookUrl": HOOK_URL,           # куда придёт вебхук об оплате
        "successUrl": LAVA_SUCCESS_URL,
        "failUrl": LAVA_FAIL_URL,
        # Любые твои данные, по которым ты найдёшь пользователя:
        "metadata": {
            "user_id": str(user_id),
            "chat_id": str(chat_id),
            "email": email,
            "tariff": tariff
        }
    }

    print(f"🔧 Создаем инвойс через API: {payload}")
    data = lava_post("/invoice/create", payload)

    # В ответе у LAVA обычно есть ссылка оплаты: payUrl / url — поддержим оба
    pay_url = data.get("payUrl") or data.get("url") or (data.get("data", {}) or {}).get("payUrl")
    if not pay_url:
        raise RuntimeError(f"Cannot find payUrl in response: {data}")

    print(f"✅ Создан инвойс: {pay_url}")
    return pay_url

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

def parse_user_from_order(order_id: str) -> tuple[int, int]:
    """
    Ждём формат: order_<user_id>_<chat_id>_<timestamp>
    Возвращаем (user_id, chat_id) либо (0, 0).
    """
    try:
        parts = order_id.split("_")
        return int(parts[1]), int(parts[2])
    except Exception:
        return 0, 0

async def _send_invite_on_success(application: Application, user_id: int, chat_id: int) -> None:
    """
    Если задан STATIC_INVITE_LINK — шлём её.
    Иначе создаём одноразовую ссылку в закрытый канал (бот должен быть админом канала!).
    """
    invite_link = STATIC_INVITE_LINK
    if not invite_link:
        # Создаём одноразовую ссылку на 1 использование, живёт 1 день.
        expire_date = int(time.time()) + 86400
        res = await application.bot.create_chat_invite_link(
            chat_id=TARGET_CHANNEL_ID,
            name=f"paid_{user_id}_{int(time.time())}",
            expire_date=expire_date,
            member_limit=1
        )
        invite_link = res.invite_link

    text = (
        "✅ Оплата успешно получена!\n\n"
        f"Вот ваша ссылка-приглашение в закрытый канал:\n{invite_link}\n\n"
        "Если ссылка не открывается, напишите сюда — мы поможем."
    )
    try:
        await application.bot.send_message(chat_id=chat_id or user_id, text=text)
    except Exception as e:
        print(f"[lava-webhook] Failed to send invite to {chat_id or user_id}: {e}")

# Flask endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/webhook-info', methods=['GET'])
def webhook_info():
    """Показывает информацию о текущем webhook"""
    try:
        webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        response = requests.get(webhook_url)
        webhook_data = response.json()
        
        current_url = webhook_data.get('result', {}).get('url', '')
        expected_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
        
        # Автоматически исправляем webhook, если он неправильный
        needs_fix = current_url != expected_url
        auto_fixed = False
        
        if needs_fix:
            print(f"⚠️ Webhook требует исправления: {current_url} != {expected_url}")
            try:
                # Удаляем старый webhook
                delete_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
                delete_response = requests.post(delete_url)
                
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
                print(f"🔧 Автоматическое исправление webhook: {set_response.status_code}")
                
                # Проверяем результат
                response = requests.get(webhook_url)
                webhook_data = response.json()
                current_url = webhook_data.get('result', {}).get('url', '')
                auto_fixed = current_url == expected_url
                
            except Exception as e:
                print(f"❌ Ошибка автоматического исправления webhook: {e}")
        
        return jsonify({
            "status": "ok",
            "webhook_info": webhook_data,
            "bot_token": TELEGRAM_BOT_TOKEN[:20] + "...",
            "expected_url": expected_url,
            "current_url": current_url,
            "pending_updates": webhook_data.get('result', {}).get('pending_update_count', 0),
            "needs_fix": needs_fix,
            "auto_fixed": auto_fixed,
            "hook_url": HOOK_URL
        })
    except Exception as e:
        print(f"❌ Ошибка получения webhook info: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/reset-webhook', methods=['GET', 'POST'])
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
        print(f"🔧 Установка webhook: {set_response.status_code} - {set_response.text}")
        
        return jsonify({
            "status": "ok",
            "delete_response": delete_response.json(),
            "set_response": set_response.json(),
            "webhook_url": webhook_url
        })
    except Exception as e:
        print(f"❌ Ошибка сброса webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

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
        print(f"📋 Raw data: {request.get_data()}")
        
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
                print(f"📋 Сообщение от пользователя: {update.message.from_user.id}")
            elif update.callback_query:
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

@app.route('/api/create-payment', methods=['POST'])
def create_payment_api():
    """
    Принимает JSON из MiniApp:
    {
      "user_id": <int>,      // Telegram user id
      "chat_id": <int>,      // chat.id пользователя (если есть)
      "email": "mail@...",
      "tariff": "basic",
      "price": 500
    }
    Возвращает { ok: true, payment_url: "..." }
    """
    try:
        print("=" * 50)
        print("📥 ПОЛУЧЕН ЗАПРОС НА СОЗДАНИЕ ПЛАТЕЖА!")
        print("=" * 50)
        
        data = request.get_json(force=True, silent=False)
        print(f"📋 Полученные данные: {data}")
        
        if not data:
            return jsonify({"ok": False, "error": "Invalid JSON"}), 400

        user_id = int(data.get("user_id") or 0)
        chat_id = int(data.get("chat_id") or user_id)  # на всякий случай используем user_id, если chat_id не прислали
        email = (data.get("email") or "").strip()
        tariff = (data.get("tariff") or "").strip()
        price = int(data.get("price") or 0)

        if not user_id or not price:
            return jsonify({"ok": False, "error": "user_id and price are required"}), 400

        print(f"📋 Создаем инвойс: user_id={user_id}, chat_id={chat_id}, email={email}, tariff={tariff}, price={price}")

        try:
            pay_url = create_lava_invoice_api(user_id, chat_id, email, tariff, price)
            return jsonify({"ok": True, "payment_url": pay_url})
        except Exception as e:
            print(f"[create-payment] ERROR: {e}")
            return jsonify({"ok": False, "error": str(e)}), 500
            
    except Exception as e:
        print(f"❌ Ошибка создания платежа: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/lava-webhook", methods=["GET", "POST"])
def lava_webhook():
    """
    Приём вебхука от LAVA. Делаем так:
      1) читаем событие (invoiceId/orderId/status)
      2) (опционально) проверяем подпись заголовка X-Signature
      3) запрашиваем статус инвойса по API (защита от подделки)
      4) при success — шлём инвайт пользователю
      5) возвращаем 200 OK
    """
    try:
        print("=" * 50)
        print("💰 ПОЛУЧЕН WEBHOOK ОТ LAVA TOP!")
        print("=" * 50)
        
        payload = request.get_json(force=True, silent=False)
        print(f"[lava-webhook] incoming: {payload}")

        # 1) Достаём идентификаторы
        invoice_id = (payload.get("invoiceId") or payload.get("id") or "").strip()
        order_id = (payload.get("orderId") or "").strip()
        status = (payload.get("status") or "").lower()

        # 2) (опциональная) проверка подписи входящего вебхука:
        # Пока отключаем проверку подписи, так как она не требуется
        print("[lava-webhook] signature check disabled")

        # 3) Подтверждаем статус по API (лучше, чем верить вебхуку на слово)
        try:
            if invoice_id:
                status_resp = lava_get("/invoice/status", {"invoiceId": invoice_id})
            elif order_id:
                status_resp = lava_get("/invoice/status", {"orderId": order_id})
            else:
                return "missing invoiceId/orderId", 200  # не ругаемся, просто игнор

            print(f"[lava-webhook] status resp: {status_resp}")
            state = (status_resp.get("status") or status_resp.get("data", {}).get("status") or "").lower()
            oid = status_resp.get("orderId") or status_resp.get("data", {}).get("orderId") or order_id

            if state in ("success", "paid", "completed"):
                user_id, chat_id = parse_user_from_order(oid or "")
                print(f"✅ Успешный платеж: user_id={user_id}, chat_id={chat_id}")
                
                # Если в твоей интеграции metadata возвращается в статусе — можно взять chat_id оттуда
                try:
                    app_obj = app  # Flask app
                    application: Application = app_obj.config.get("telegram_application")
                    if application:
                        # запуск в фоне
                        application.create_task(_send_invite_on_success(application, user_id, chat_id))
                except Exception as e:
                    print(f"[lava-webhook] schedule invite task error: {e}")

        except Exception as e:
            print(f"[lava-webhook] status check error: {e}")

        return "ok", 200
        
    except Exception as e:
        print(f"❌ Ошибка обработки webhook Lava Top: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Telegram Bot обработчики
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
        [InlineKeyboardButton("💳 Оплатить через Mini Apps", web_app={"url": "https://acqu1red.github.io/formulaprivate/"})],
        [InlineKeyboardButton("🔙 Назад", callback_data="back_to_start")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(text, parse_mode='HTML', reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, parse_mode='HTML', reply_markup=reply_markup)

async def more_info(update: Update, context: CallbackContext):
    """Показывает подробную информацию"""
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
            
            # Пробуем декодировать из base64, если не получится - используем как есть
            try:
                decoded_data = base64.b64decode(web_app_data).decode('utf-8')
                print(f"📱 Декодированные данные из base64: {decoded_data}")
                payment_data = json.loads(decoded_data)
            except Exception as decode_error:
                # Если не base64, пробуем парсить как обычный JSON
                print(f"📱 Ошибка декодирования base64: {decode_error}")
                print(f"📱 Парсим как обычный JSON: {web_app_data}")
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

async def process_payment_data(update: Update, context: CallbackContext, payment_data: dict):
    """Обрабатывает данные платежа от Mini Apps"""
    user = update.effective_user
    message = update.message
    
    try:
        print(f"📱 Обрабатываем данные платежа: {payment_data}")
        
        # Проверяем тип данных (пошаговая отправка)
        step = payment_data.get('step')
        print(f"📋 Шаг данных: {step}")
        
        if step == 'final_data':
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
            
            print("✅ Все данные получены, создаем инвойс через API...")
            
            # Создаем инвойс через API
            try:
                pay_url = create_lava_invoice_api(user.id, message.chat.id, email, tariff, price)
                print(f"✅ Инвойс создан успешно: {pay_url}")
                
                # Отправляем сообщение с кнопкой оплаты
                keyboard = [[InlineKeyboardButton("💳 Оплатить", url=pay_url)]]
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
            except Exception as e:
                print(f"❌ Ошибка создания инвойса через API: {e}")
                await message.reply_text(f"❌ Ошибка создания платежа: {e}")
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
    elif query.data == "more_info":
        await more_info(update, context)
    elif query.data == "back_to_start":
        await start(update, context)

def main() -> None:
    """Основная функция запуска бота"""
    print("🚀 Запуск бота с Lava API...")
    print(f"🔑 TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"🔑 LAVA_API_KEY: {LAVA_API_KEY[:20]}...")
    print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
    print(f"🔑 HOOK_URL: {HOOK_URL}")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    
    # Создаем приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.telegram_app = application # Привязываем приложение к Flask
    app.config["telegram_application"] = application # Для webhook
    
    print("📝 Регистрация обработчиков...")
    
    # Обработчик для web_app_data должен быть первым
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    
    # Регистрируем обработчики кнопок и сообщений
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, lambda u, c: None))
    
    print("✅ Обработчики зарегистрированы")
    
    # Настраиваем Mini Apps для бота
    try:
        print("🔧 Настройка Mini Apps...")
        # Устанавливаем команды для бота
        commands = [
            ("start", "Запустить бота")
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
        
        print(f"🔧 Webhook данные: {webhook_data}")
        
        try:
            # Сначала удаляем старый webhook
            delete_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
            delete_response = requests.post(delete_webhook_url)
            print(f"🗑️ Удаление старого webhook: {delete_response.status_code} - {delete_response.text}")
            
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
            
            print(f"🔧 Webhook данные с параметрами: {webhook_data_with_params}")
            
            response = requests.post(webhook_setup_url, json=webhook_data_with_params)
            print(f"📡 Ответ установки webhook: {response.status_code} - {response.text}")
            if response.status_code == 200:
                print("✅ Webhook успешно установлен")
                
                # Ждем немного
                time.sleep(2)
                
                # Проверяем текущий webhook
                get_webhook_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
                webhook_info = requests.get(get_webhook_url)
                webhook_result = webhook_info.json()
                print(f"📋 Информация о webhook: {webhook_result}")
                
                # Проверяем, что URL правильный
                if webhook_result.get('ok') and webhook_result.get('result', {}).get('url'):
                    actual_url = webhook_result['result']['url']
                    print(f"🔍 Фактический webhook URL: {actual_url}")
                    expected_url = f"{webhook_url}/webhook"
                    if actual_url != expected_url:
                        print(f"⚠️ ВНИМАНИЕ: URL webhook не совпадает!")
                        print(f"   Ожидалось: {expected_url}")
                        print(f"   Фактически: {actual_url}")
                        
                        # Пробуем еще раз
                        print("🔄 Пробуем установить webhook еще раз...")
                        response2 = requests.post(webhook_setup_url, json=webhook_data_with_params)
                        print(f"📡 Повторная установка: {response2.status_code} - {response2.text}")
                    else:
                        print("✅ Webhook URL установлен правильно!")
                else:
                    print("❌ Не удалось получить информацию о webhook")
                    print(f"📋 Полный ответ: {webhook_result}")
            else:
                print(f"❌ Ошибка установки webhook: {response.text}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
    else:
        print("⚠️ RAILWAY_STATIC_URL не установлен")
    
    print("🚀 Запуск Flask приложения...")
    app.run(host='0.0.0.0', port=8080, debug=False)

if __name__ == "__main__":
    main()
