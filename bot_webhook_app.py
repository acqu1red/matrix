#!/usr/bin/env python3
import os, json, logging, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from lava_app_client import create_invoice, LavaAppError

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", force=True)
log = logging.getLogger("app")

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
WEBHOOK_URL = os.environ.get("WEBHOOK_URL", "")
LAVA_TOP_API_KEY = os.environ.get("LAVA_TOP_API_KEY", "")
LAVA_OFFER_ID_BASIC = os.environ.get("LAVA_OFFER_ID_BASIC", "")
PAYMENT_MINIAPP_URL = os.environ.get("PAYMENT_MINIAPP_URL", "https://acqu1red.github.io/formulaprivate/payment.html")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "any")

app = Flask(__name__)
CORS(app)
app.telegram_app = None

async def start(update: Update, context: CallbackContext):
    kb = [[InlineKeyboardButton("Оплатить", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))]]
    await update.message.reply_text("Выберите действие:", reply_markup=InlineKeyboardMarkup(kb))

async def payment(update: Update, context: CallbackContext):
    return await start(update, context)

async def handle_web_app_data(update: Update, context: CallbackContext):
    msg = update.message
    if not (hasattr(msg, "web_app_data") and msg.web_app_data and msg.web_app_data.data):
        await msg.reply_text("Данные от Mini App не найдены")
        return
    try:
        data = json.loads(msg.web_app_data.data)
    except Exception as e:
        await msg.reply_text(f"Ошибка парсинга JSON: {e}")
        return

    email = data.get("email") or data.get("userEmail")
    tariff = (data.get("tariff") or data.get("selectedTariff") or "basic").lower()
    bank = (data.get("bank") or data.get("selectedBank") or "russian").lower()
    currency = (data.get("currency") or ("RUB" if bank == "russian" else "USD")).upper()

    offer_id = os.environ.get("LAVA_OFFER_ID_BASIC")
    if not offer_id:
        await msg.reply_text("Не настроен OFFER_ID")
        return

    client_utm = {"tg_id": str(update.effective_user.id), "tariff": tariff, "bank": bank}

    try:
        inv = create_invoice(api_key=LAVA_TOP_API_KEY, offer_id=offer_id, email=email,
                             currency=currency, payment_method=None, buyer_language="RU",
                             client_utm=client_utm)
        await msg.reply_text(f"Ссылка на оплату:\n{inv['paymentUrl']}")
    except LavaAppError as e:
        await msg.reply_text(f"Ошибка LAVA: {e}")
    except Exception as e:
        await msg.reply_text(f"Ошибка сервера: {e}")

async def button(update: Update, context: CallbackContext):
    pass

async def any_msg(update: Update, context: CallbackContext):
    if update.message and update.message.text:
        await update.message.reply_text("Я на месте. Нажмите «Оплатить».")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/webhook-info", methods=["GET"])
def webhook_info():
    try:
        r = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/webhook", methods=["GET", "POST"])
def telegram_webhook():
    if request.method == "GET":
        try:
            info = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10).json()
            current = info.get("result", {}).get("url", "")
            expected = f"{WEBHOOK_URL.rstrip('/')}/webhook" if WEBHOOK_URL else ""
            if expected and current != expected:
                requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                              json={"url": expected, "secret_token": WEBHOOK_SECRET,
                                    "max_connections": 40,
                                    "allowed_updates": ["message", "callback_query"]},
                              timeout=10)
        except Exception as e:
            log.exception("Webhook self-heal failed: %s", e)
        return jsonify({"ok": True})

    data = request.get_json(silent=True)
    if not data or "update_id" not in data:
        return jsonify({"error": "not telegram"}), 400
    update = Update.de_json(data, app.telegram_app.bot)
    try:
        app.telegram_app.create_task(app.telegram_app.process_update(update))
    except Exception:
        import asyncio
        asyncio.get_event_loop().run_until_complete(app.telegram_app.process_update(update))
    return jsonify({"ok": True})

@app.route("/api/create-payment", methods=["POST"])
def api_create_payment():
    try:
        payload = request.get_json(force=True)
        email = payload.get("email")
        tariff = (payload.get("tariff") or "basic").lower()
        bank = (payload.get("bank") or "russian").lower()
        currency = (payload.get("currency") or ("RUB" if bank == "russian" else "USD")).upper()
        offer_id = os.environ.get("LAVA_OFFER_ID_BASIC")
        utm = {"api": "create-payment", "tariff": tariff, "bank": bank}
        inv = create_invoice(api_key=LAVA_TOP_API_KEY, offer_id=offer_id, email=email,
                             currency=currency, payment_method=None, buyer_language="RU",
                             client_utm=utm)
        return jsonify({"ok": True, "paymentUrl": inv["paymentUrl"], "raw": inv["raw"]})
    except LavaAppError as e:
        return jsonify({"ok": False, "error": str(e)}), 400
    except Exception as e:
        log.exception("API error")
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/lava-webhook", methods=["POST"])
def lava_webhook():
    try:
        data = request.get_json(force=True)
        log.info("LAVA webhook: %s", data)
        event = data.get("eventType")
        status = data.get("status")
        client_utm = data.get("clientUtm") or {}
        if event == "payment.success" or status == "completed":
            tg_id = client_utm.get("tg_id")
            if tg_id:
                try:
                    requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                                  json={"chat_id": tg_id, "text": "✅ Оплата прошла успешно. Спасибо!"},
                                  timeout=10)
                except Exception:
                    log.exception("Failed to notify buyer in Telegram")
        return jsonify({"ok": True})
    except Exception as e:
        log.exception("LAVA webhook error")
        return jsonify({"ok": False, "error": str(e)}), 400

def main():
    if not TELEGRAM_BOT_TOKEN: raise RuntimeError("TELEGRAM_BOT_TOKEN is required")
    if not LAVA_TOP_API_KEY: raise RuntimeError("LAVA_TOP_API_KEY is required")
    if not LAVA_OFFER_ID_BASIC: raise RuntimeError("LAVA_OFFER_ID_BASIC is required")
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("payment", payment))
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, any_msg))
    app.telegram_app = application
    if WEBHOOK_URL:
        try:
            requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                          json={"url": f"{WEBHOOK_URL.rstrip('/')}/webhook",
                                "secret_token": WEBHOOK_SECRET, "max_connections": 40,
                                "allowed_updates": ["message", "callback_query"]},
                          timeout=10)
        except Exception:
            log.exception("Failed to set webhook")
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()
