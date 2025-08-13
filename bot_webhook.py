#!/usr/bin/env python3
"""
Telegram Bot with Webhook support for Railway deployment - CLEAN VERSION
"""

import os
import hmac
import hashlib
import json
import time
import base64
from datetime import datetime
from urllib.parse import urlencode
import requests
from flask import Flask, request, jsonify

# для телеграма
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from telegram.constants import ParseMode

# === TELEGRAM CONFIG ===
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "708907063,7365307696").split(",") if x.strip()]

# === LAVA API CONFIG ===
LAVA_API_BASE = os.getenv("LAVA_API_BASE", "https://api.lava.ru/business")
LAVA_API_KEY = os.getenv("LAVA_API_KEY", "whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav")
LAVA_SHOP_ID = os.getenv("LAVA_SHOP_ID", "1b9f3e05-86aa-4102-9648-268f0f586bb1")
LAVA_SUCCESS_URL = os.getenv("LAVA_SUCCESS_URL", "https://t.me/formulaprivate_bot?start=paid")
LAVA_FAIL_URL = os.getenv("LAVA_FAIL_URL", "https://t.me/formulaprivate_bot?start=fail")

# Хук, на который LAVA пришлет статус:
PUBLIC_BASE_URL = os.getenv("RAILWAY_STATIC_URL") or os.getenv("PUBLIC_BASE_URL") or "https://formulaprivate-productionpaymentuknow.up.railway.app"
HOOK_URL = f"{PUBLIC_BASE_URL}/lava-webhook" if PUBLIC_BASE_URL else ""

# === CHANNEL/INVITES ===
TARGET_CHANNEL_ID = int(os.getenv("TARGET_CHANNEL_ID", "-1001234567890"))  # например: -1001234567890
STATIC_INVITE_LINK = os.getenv("STATIC_INVITE_LINK")  # если не задано, создаём одноразовую ссылку

# === MINI APPS ===
MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/?type=support"
PAYMENT_MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/payment.html"

# Flask app
app = Flask(__name__)

# Для подписи запросов (часть интеграций LAVA требует HMAC; оставляем гибко)
def _lava_signature(body: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()

def _lava_headers(body: str) -> dict:
    # Используем только Bearer авторизацию без подписи
    return {
        "Authorization": f"Bearer {LAVA_API_KEY}",
        "Content-Type": "application/json",
    }

def lava_post(path: str, payload: dict) -> dict:
    url = f"{LAVA_API_BASE.rstrip('/')}/{path.lstrip('/')}"
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    headers = _lava_headers(body)
    print(f"[LAVA POST] URL: {url}")
    print(f"[LAVA POST] Headers: {headers}")
    print(f"[LAVA POST] Body: {body}")
    resp = requests.post(url, data=body.encode("utf-8"), headers=headers, timeout=20)
    print(f"[LAVA POST] Response: {resp.status_code} - {resp.text}")
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
    resp = requests.get(url, params=params, headers=headers, timeout=20)
    try:
        data = resp.json()
    except Exception:
        raise RuntimeError(f"Lava API non-JSON response: {resp.status_code} {resp.text[:200]}")
    if resp.status_code >= 300:
        raise RuntimeError(f"Lava API error {resp.status_code}: {data}")
    return data

def create_lava_invoice_api(user_id: int, chat_id: int, email: str, tariff: str, price_rub: int) -> str:
    """
    Создаёт прямую ссылку на оплату Lava Top.
    Используем прямой URL вместо API для обхода проблем с подписью.
    """
    if not LAVA_SHOP_ID:
        raise RuntimeError("LAVA_SHOP_ID is not set")

    # Уникальный orderId: содержит и user_id, и chat_id для обратной связи
    ts = int(time.time())
    order_id = f"order_{user_id}_{chat_id}_{ts}"

    # Создаем прямую ссылку на Lava Top
    # Формат: https://app.lava.top/ru/products/{shop_id}/{product_id}?currency=RUB&amount={amount}&order_id={order_id}&metadata={json.dumps(...)}
    
    # Используем product_id из вашей ссылки
    product_id = "302ecdcd-1581-45ad-8353-a168f347b8cc"
    
    # Метаданные для передачи в URL
    metadata = {
        "user_id": str(user_id),
        "chat_id": str(chat_id),
        "email": email,
        "tariff": tariff
    }
    
    # Создаем URL параметры
    params = {
        "currency": "RUB",
        "amount": str(price_rub),
        "order_id": order_id,
        "metadata": json.dumps(metadata, ensure_ascii=False)
    }
    
    # Если есть webhook URL, добавляем его
    if HOOK_URL:
        params["hook_url"] = HOOK_URL
    
    # Создаем URL
    base_url = f"https://app.lava.top/ru/products/{LAVA_SHOP_ID}/{product_id}"
    query_string = urlencode(params)
    pay_url = f"{base_url}?{query_string}"

    print(f"[create_lava_invoice_api] Generated direct pay_url: {pay_url}")
    return pay_url

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
        print(f"[_send_invite_on_success] Invite sent to {chat_id or user_id}")
    except Exception as e:
        print(f"[_send_invite_on_success] Failed to send invite to {chat_id or user_id}: {e}")

# Flask endpoints
@app.route("/health")
def health():
    return "ok"

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
        print(f"📱 Получен POST запрос на /webhook")
        print(f"📱 Headers: {dict(request.headers)}")
        print(f"📱 Content-Type: {request.content_type}")
        
        update_data = request.get_json(force=True, silent=False)
        print(f"📱 Получен Telegram update: {update_data}")
        
        # Передаем update в Telegram application
        application = app.config.get("telegram_application")
        if application:
            print(f"📱 Application найден, обрабатываем update...")
            # Создаем Update объект
            update = Update.de_json(update_data, application.bot)
            print(f"📱 Update объект создан: {update}")
            
            # Обрабатываем update синхронно
            try:
                application.process_update(update)
                print(f"📱 Update обработан успешно")
            except Exception as process_error:
                print(f"❌ Ошибка обработки update: {process_error}")
                import traceback
                print(f"❌ Traceback: {traceback.format_exc()}")
        else:
            print(f"❌ Application не найден в app.config")
        
        return "ok"
    except Exception as e:
        print(f"❌ Ошибка обработки Telegram update: {e}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return "error", 500

@app.route("/api/create-payment", methods=["POST"])
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
        data = request.get_json(force=True, silent=False)
        print(f"📋 Получены данные для создания платежа: {data}")
    except Exception:
        return jsonify({"ok": False, "error": "Invalid JSON"}), 400

    user_id = int(data.get("user_id") or 0)
    chat_id = int(data.get("chat_id") or user_id)  # на всякий случай используем user_id, если chat_id не прислали
    email = (data.get("email") or "").strip()
    tariff = (data.get("tariff") or "").strip()
    price = int(data.get("price") or 0)

    if not user_id or not price:
        return jsonify({"ok": False, "error": "user_id and price are required"}), 400

    try:
        pay_url = create_lava_invoice_api(user_id, chat_id, email, tariff, price)
        print(f"✅ Создан платеж: {pay_url}")
        return jsonify({"ok": True, "payment_url": pay_url})
    except Exception as e:
        print(f"[create-payment] ERROR: {e}")
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
    if request.method == "GET":
        return "Lava webhook endpoint is working"
    
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception:
        return "bad json", 400

    print(f"[lava-webhook] incoming: {payload}")

    # 1) Достаём идентификаторы
    invoice_id = (payload.get("invoiceId") or payload.get("id") or "").strip()
    order_id = (payload.get("orderId") or "").strip()
    status = (payload.get("status") or "").lower()

    # 2) (опциональная) проверка подписи входящего вебхука:
    # try:
    #     # Если LAVA присылает 'X-Signature' как HMAC(body, secret) — проверим:
    #     given_sig = request.headers.get("X-Signature")
    #     if given_sig:
    #         expected = _lava_signature(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), LAVA_API_KEY)
    #         if not hmac.compare_digest(given_sig, expected):
    #             print("[lava-webhook] signature mismatch")
    #             # не отбрасываем, но отметим в логах
    # except Exception as _:
    #     pass

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
            # Если в твоей интеграции metadata возвращается в статусе — можно взять chat_id оттуда
            try:
                application: Application = app.config.get("telegram_application")
                if application:
                    # запуск в фоне
                    application.create_task(_send_invite_on_success(application, user_id, chat_id))
            except Exception as e:
                print(f"[lava-webhook] schedule invite task error: {e}")

    except Exception as e:
        print(f"[lava-webhook] status check error: {e}")

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

@app.route("/debug")
def debug_info():
    """Отладочная информация о переменных окружения"""
    debug_data = {
        "TELEGRAM_BOT_TOKEN": TELEGRAM_BOT_TOKEN[:20] + "..." if TELEGRAM_BOT_TOKEN else "NOT SET",
        "LAVA_API_KEY": LAVA_API_KEY[:20] + "..." if LAVA_API_KEY else "NOT SET",
        "LAVA_SHOP_ID": LAVA_SHOP_ID,
        "PUBLIC_BASE_URL": PUBLIC_BASE_URL,
        "HOOK_URL": HOOK_URL,
        "ADMIN_IDS": ADMIN_IDS,
        "TARGET_CHANNEL_ID": TARGET_CHANNEL_ID,
        "STATIC_INVITE_LINK": STATIC_INVITE_LINK or "NOT SET"
    }
    return jsonify(debug_data)

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
        print(f"📱 Все атрибуты сообщения: {dir(update.message)}")
        print(f"📱 web_app_data.data тип: {type(update.message.web_app_data.data)}")
        print(f"📱 Содержимое сообщения: {update.message}")
        
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
        
        print(f"📋 Тип данных: {type(payment_data)}")
        
        # Извлекаем данные из payment_data
        if isinstance(payment_data, dict):
            # Если данные пришли в формате {step: "final_data", data: {...}}
            if "step" in payment_data and payment_data["step"] == "final_data":
                final_data = payment_data.get("data", {})
                email = final_data.get("email", "")
                tariff = final_data.get("tariff", "1_month")
                price = int(final_data.get("price", 50))
            else:
                # Прямой формат данных
                email = payment_data.get("email", "")
                tariff = payment_data.get("tariff", "1_month")
                price = int(payment_data.get("price", 50))
        else:
            await update.message.reply_text("❌ Неверный формат данных. Попробуйте еще раз.")
            return
        
        print(f"📋 Обработанные данные: email={email}, tariff={tariff}, price={price}")
        
        # Создаем платеж через API
        try:
            pay_url = create_lava_invoice_api(user.id, chat_id, email, tariff, price)
            
            text = (
                "✅ <b>Заявка принята!</b>\n\n"
                "Нажмите кнопку, чтобы перейти к оплате. После успешной оплаты доступ придёт автоматически."
            )
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton("💳 Оплатить (Lava)", url=pay_url)]
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
    print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
    print(f"🔑 LAVA_SECRET_KEY: {LAVA_API_KEY[:20]}...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    
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
