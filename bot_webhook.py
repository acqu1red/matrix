
#!/usr/bin/env python3
"""
Telegram bot + Flask webhook server for Railway
- Creates LAVA Business API invoices
- Receives LAVA webhooks and sends invite link to a private channel
- Handles Telegram WebApp data (miniapp -> bot)
"""
import os
import json
import time
import hmac
import hashlib
from datetime import datetime
from urllib.parse import urlencode

import aiohttp
import asyncio
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes, CallbackContext, filters

from telegram.constants import ParseMode

# -----------------------------
# Environment
# -----------------------------
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
PUBLIC_BASE_URL    = os.getenv("PUBLIC_BASE_URL", "")  # e.g. https://your-app.up.railway.app

# LAVA Business API (Bearer token) and project
LAVA_API_KEY = os.getenv("LAVA_API_KEY", "")
LAVA_SHOP_ID = os.getenv("LAVA_SHOP_ID", "")

# Optional: extra validation of incoming LAVA webhooks (shared secret if configured)
LAVA_WEBHOOK_SECRET = os.getenv("LAVA_WEBHOOK_SECRET", "")  # optional HMAC secret

# Telegram
PRIVATE_CHANNEL_ID = os.getenv("PRIVATE_CHANNEL_ID")  # e.g. -1001234567890 (string)
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip().isdigit()]

# Redirects after payment (optional)
SUCCESS_REDIRECT_URL = os.getenv("SUCCESS_REDIRECT_URL", "")
FAIL_REDIRECT_URL    = os.getenv("FAIL_REDIRECT_URL", "")

# Miniapp URL
PAYMENT_MINIAPP_URL = os.getenv("PAYMENT_MINIAPP_URL", "https://acqu1red.github.io/formulaprivate/payment.html")

# LAVA endpoints
LAVA_ENDPOINTS = [
    "https://api.lava.ru/business",
    "https://api.lava.top/business",  # fallback
]

# -----------------------------
# Flask app + Telegram Application
# -----------------------------
app = Flask(__name__)
application: Application | None = None

# -----------------------------
# Telegram Handlers
# -----------------------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    kb = InlineKeyboardMarkup([[
        InlineKeyboardButton("💳 Оплатить (Mini App)", web_app=WebAppInfo(PAYMENT_MINIAPP_URL))
    ]])
    await update.message.reply_text(
        "Привет! Готовы оформить доступ? Нажми кнопку, чтобы открыть мини‑приложение.",
        reply_markup=kb
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        if not update.message or not update.message.web_app_data:
            return
        data_raw = update.message.web_app_data.data
        payment = json.loads(data_raw)
        user = update.effective_user
        chat_id = update.effective_chat.id

        pay_url = await create_lava_invoice(payment, user.id, chat_id)
        kb = InlineKeyboardMarkup([[InlineKeyboardButton("Перейти к оплате", url=pay_url)]])
        await update.message.reply_text(
            "✅ Заявка принята. Нажмите, чтобы оплатить. После успешной оплаты доступ придёт автоматически.",
            reply_markup=kb
        )
    except Exception as e:
        await update.message.reply_text("❌ Не удалось создать платёж, попробуйте ещё раз.")
        for admin in ADMIN_IDS:
            try:
                await context.bot.send_message(admin, f"❌ Ошибка создания инвойса: {e}")
            except: pass

# Fallback: if miniapp POSTs directly to our API, this endpoint handles it
@app.post("/api/create-payment")
def api_create_payment():
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        user_id = int(data.get("user_id") or data.get("tg_user_id") or 0)
        chat_id = int(data.get("chat_id") or 0)
        if not user_id or not chat_id:
            return jsonify({"ok": False, "error": "missing user_id/chat_id"}), 400
        pay_url = asyncio.run(create_lava_invoice(data, user_id, chat_id))
        return jsonify({"ok": True, "payment_url": pay_url})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

# -----------------------------
# LAVA invoice creation
# -----------------------------
async def create_lava_invoice(payment_data: dict, user_id: int, chat_id: int) -> str:
    """
    Creates invoice via LAVA Business API and returns payUrl
    """
    if not (TELEGRAM_BOT_TOKEN and LAVA_API_KEY and LAVA_SHOP_ID and PUBLIC_BASE_URL):
        raise RuntimeError("Missing TELEGRAM_BOT_TOKEN/LAVA_API_KEY/LAVA_SHOP_ID/PUBLIC_BASE_URL")

    amount = int(payment_data.get("price") or payment_data.get("amount") or 50)
    email  = (payment_data.get("email") or "").strip()
    tariff = (payment_data.get("tariff") or "default").strip()
    bank   = (payment_data.get("bank") or "russian").strip()

    order_id = f"order_{user_id}_{int(time.time())}"
    payload = {
        "shopId": LAVA_SHOP_ID,
        "sum": float(amount),
        "orderId": order_id,
        "comment": f"{tariff} for {email}" if email else tariff,
        **({"hookUrl": f"{PUBLIC_BASE_URL.rstrip('/')}/lava-webhook"} if PUBLIC_BASE_URL else {}),
        **({"successUrl": SUCCESS_REDIRECT_URL} if SUCCESS_REDIRECT_URL else {}),
        **({"failUrl": FAIL_REDIRECT_URL} if FAIL_REDIRECT_URL else {}),
        "customFields": {
            "user_id": str(user_id),
            "chat_id": str(chat_id),
            "email": email,
            "tariff": tariff,
            "bank": bank,
        }
    }

    headers = {
        "Authorization": f"Bearer {LAVA_API_KEY}",
        "Content-Type": "application/json",
    }

    last_error = None
    for base in LAVA_ENDPOINTS:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{base}/invoice/create", headers=headers, data=json.dumps(payload)) as resp:
                    text = await resp.text()
                    if resp.status != 200:
                        raise RuntimeError(f"LAVA {base} {resp.status}: {text}")
                    data = json.loads(text)
                    pay_url = data.get("payUrl") or data.get("url") or data.get("payment_url")
                    if not pay_url:
                        raise RuntimeError(f"No payUrl in response: {data}")
                    return pay_url
        except Exception as e:
            last_error = e
            continue
    raise last_error or RuntimeError("Failed to create invoice")

# -----------------------------
# LAVA webhook
# -----------------------------
def verify_lava_signature(raw_body: bytes) -> bool:
    if not LAVA_WEBHOOK_SECRET:
        return True
    # HMAC SHA256 of raw JSON with shared secret; header name may vary, keep soft
    provided = request.headers.get("X-Signature", "") or request.headers.get("X-Lava-Signature", "")
    digest = hmac.new(LAVA_WEBHOOK_SECRET.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return provided and provided.lower() == digest.lower()

@app.post("/lava-webhook")
def lava_webhook():
    raw = request.get_data()
    if not verify_lava_signature(raw):
        return jsonify({"ok": False, "error": "bad signature"}), 403
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or data.get("paymentStatus") or "").lower()
    custom = data.get("customFields") or {}
    chat_id = int(custom.get("chat_id") or 0)
    user_id = int(custom.get("user_id") or 0)

    # You may also re-check invoice status via API here.
    if status not in {"success", "paid", "confirmed"}:
        return jsonify({"ok": True, "ignored": True})

    if not (application and application.bot and PRIVATE_CHANNEL_ID and chat_id):
        return jsonify({"ok": False, "error": "misconfiguration"}), 500

    try:
        invite = application.bot.create_chat_invite_link(
            chat_id=PRIVATE_CHANNEL_ID,
            member_limit=1,
            creates_join_request=False
        )
        application.bot.send_message(
            chat_id=chat_id,
            text=(
                "🎉 Оплата прошла успешно!\n\n"
                f"Ваша ссылка в закрытый канал:\n{invite.invite_link}\n\n"
                "Если ссылка не открывается — отправьте /start."
            ),
            parse_mode=ParseMode.HTML
        )
        return jsonify({"ok": True})
    except Exception as e:
        for admin in ADMIN_IDS:
            try:
                application.bot.send_message(admin, f"❌ Ошибка отправки инвайта: {e}")
            except: pass
        return jsonify({"ok": False, "error": str(e)}), 500

# -----------------------------
# Telegram webhook endpoint
# -----------------------------
@app.post("/webhook")
def telegram_webhook():
    if not application:
        return jsonify({"ok": False, "error": "telegram not ready"}), 503
    data = request.get_json(force=True, silent=True) or {}
    update = Update.de_json(data, application.bot)
    # Process synchronously via application
    application.update_queue.put_nowait(update)
    return jsonify({"ok": True})

@app.get("/")
def root():
    return jsonify({"message": "Telegram Bot Webhook Server", "status": "running"})

@app.get("/health")
def health():
    try:
        # Basic health check
        health_status = {
            "status": "ok",
            "ts": datetime.now().isoformat(),
            "bot_ready": application is not None,
            "webhook_url": f"{PUBLIC_BASE_URL.rstrip('/')}/webhook" if PUBLIC_BASE_URL else None
        }
        return jsonify(health_status)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e), "ts": datetime.now().isoformat()}), 500

@app.get("/webhook-info")
async def webhook_info():
    if not application:
        return jsonify({"ok": False, "error": "telegram not ready"}), 503
    me = await application.bot.get_me()
    info = await application.bot.get_webhook_info()
    return jsonify({"bot": me.to_dict(), "webhook": info.to_dict()})

@app.post("/reset-webhook")
def reset_webhook():
    if not application:
        return jsonify({"ok": False, "error": "telegram not ready"}), 503
    url = f"{PUBLIC_BASE_URL.rstrip('/')}/webhook"
    # We cannot call async from sync directly; schedule
    async def _set():
        await application.bot.set_webhook(url=url, allowed_updates=["message","callback_query","chat_member","chat_join_request"])
    application.create_task(_set())
    return jsonify({"ok": True, "url": url})

# -----------------------------
# Bootstrap
# -----------------------------
def build_application() -> Application:
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN not set")
    app_ = Application.builder().token(TELEGRAM_BOT_TOKEN).concurrent_updates(True).build()
    app_.add_handler(CommandHandler("start", start))
    app_.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    # optional: ignore other messages
    return app_

def main():
    global application
    application = build_application()
    # We don't run polling; Flask will feed updates
    # Try to set webhook automatically if PUBLIC_BASE_URL is present
    if PUBLIC_BASE_URL:
        def _auto():
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(application.bot.set_webhook(
                    url=f"{PUBLIC_BASE_URL.rstrip('/')}/webhook",
                    allowed_updates=["message","callback_query","chat_member","chat_join_request"]
                ))
                loop.close()
            except Exception as e:
                print(f"⚠️ Webhook setup error: {e}")
        
        # Run webhook setup in background thread
        import threading
        thread = threading.Thread(target=_auto)
        thread.daemon = True
        thread.start()

if __name__ == "__main__":
    # Initialize bot in background
    main()
    
    # Start Flask server
    port = int(os.getenv("PORT", 5000))
    print(f"🚀 Starting Flask server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
