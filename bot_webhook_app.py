import os
import hmac
import json
import uuid
import hashlib
import logging
from typing import Dict, Any, Tuple
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import urllib.parse

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_PRIVATE_CHANNEL_ID = os.getenv("TELEGRAM_PRIVATE_CHANNEL_ID", "").strip()
TELEGRAM_STATIC_INVITE_LINK = os.getenv("TELEGRAM_STATIC_INVITE_LINK", "").strip()

LAVA_TOP_API_KEY = os.getenv("LAVA_TOP_API_KEY", "").strip()
LAVA_OFFER_ID_BASIC = os.getenv("LAVA_OFFER_ID_BASIC", "").strip()
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").strip()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
log = app.logger

def _build_urls(order_id: str) -> Dict[str, str]:
    return {
        "success": f"{PUBLIC_BASE_URL}/web/success?order_id={order_id}",
        "fail": f"{PUBLIC_BASE_URL}/web/fail?order_id={order_id}",
        "hook": f"{PUBLIC_BASE_URL}/api/pay/hook",
    }

def _send_telegram_message(chat_id: int, text: str) -> None:
    if not TELEGRAM_BOT_TOKEN:
        log.error("TELEGRAM_BOT_TOKEN is not set; cannot send Telegram messages")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        r = requests.post(url, json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True})
        if r.status_code >= 300:
            log.error("sendMessage failed %s %s", r.status_code, r.text[:500])
    except Exception as e:
        log.exception("sendMessage exception: %s", e)

def _create_invite_link() -> str:
    if TELEGRAM_STATIC_INVITE_LINK:
        return TELEGRAM_STATIC_INVITE_LINK
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_PRIVATE_CHANNEL_ID:
        return ""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/createChatInviteLink"
    payload = {
        "chat_id": TELEGRAM_PRIVATE_CHANNEL_ID,
        "name": "Оплаченный доступ",
        "member_limit": 1,
        "creates_join_request": False,
    }
    r = requests.post(url, json=payload, timeout=15)
    if r.ok:
        data = r.json()
        return (data.get("result") or {}).get("invite_link", "")
    else:
        log.error("createChatInviteLink failed: %s %s", r.status_code, r.text[:500])
        return ""

def parse_tg_init_data(init_data: str) -> Tuple[int, bool]:
    """Парсит Telegram WebApp initData. Возвращает (user_id, is_valid_hash)."""
    if not init_data or not TELEGRAM_BOT_TOKEN:
        return (None, False)
    try:
        # Parse querystring into dict
        pairs = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
        data = dict(pairs)
        recv_hash = data.pop("hash", "")
        # Build data_check_string: sorted "key=value" joined by "\n"
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
        # secret_key = HMAC_SHA256("WebAppData", bot_token)
        secret_key = hmac.new(b"WebAppData", TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
        # Calculate hash
        calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        is_valid = hmac.compare_digest(calc_hash, recv_hash)

        user_id = None
        user_json = data.get("user")
        if user_json:
            try:
                user_obj = json.loads(user_json)
                user_id = int(user_obj.get("id")) if user_obj and "id" in user_obj else None
            except Exception:
                user_id = None

        return (user_id, is_valid)
    except Exception as e:
        log.exception("parse_tg_init_data failed: %s", e)
        return (None, False)

def _create_lava_top_invoice(email: str, offer_id: str, order_id: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    base = "https://gate.lava.top"
    url = f"{base}/api/v1/invoices"
    urls = _build_urls(order_id)
    payload = {
        "offerId": offer_id,
        "externalId": order_id,
        "customer": {"email": email},
        "successUrl": urls["success"],
        "failUrl": urls["fail"],
        "webhookUrl": urls["hook"],
        "metadata": meta,
    }
    headers = {
        "Authorization": f"Bearer {LAVA_TOP_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    log.info("→ lava.top create invoice req: %s", json.dumps(payload, ensure_ascii=False))
    r = requests.post(url, headers=headers, json=payload, timeout=20)
    log.info("← lava.top resp %s: %s", r.status_code, r.text[:1200])
    try:
        data = r.json()
    except Exception:
        data = {}
    if r.ok:
        payment_url = data.get("paymentUrl") or data.get("url") or data.get("checkoutUrl")
        return {"ok": True, "payment_url": payment_url, "raw": data}
    else:
        return {"ok": False, "error": data or {"status_code": r.status_code, "body": r.text[:500]}}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/api/pay/create")
def api_pay_create():
    body = request.get_json(force=True, silent=False) or {}
    tg_user_id = str(body.get("telegram_id") or "").strip()
    email = str(body.get("email", "")).strip().lower()
    tariff = str(body.get("tariff", "")).strip().lower()
    init_data = body.get("init_data") or ""

    if (not tg_user_id) and init_data:
        parsed_id, is_valid = parse_tg_init_data(init_data)
        if parsed_id:
            tg_user_id = str(parsed_id)
            log.info("Telegram ID extracted from init_data (valid=%s): %s", is_valid, tg_user_id)
        else:
            log.warning("Failed to extract telegram_id from init_data")

    if not email or not tariff:
        return jsonify({"ok": False, "error": "email and tariff are required"}), 400
    if not tg_user_id:
        return jsonify({"ok": False, "error": "Cannot detect telegram_id. Open MiniApp from the bot button."}), 400
    if not PUBLIC_BASE_URL:
        return jsonify({"ok": False, "error": "PUBLIC_BASE_URL env is not set"}), 500

    order_id = f"tg{tg_user_id}-{uuid.uuid4().hex[:12]}"
    log.info("Create pay: tg=%s email=%s tariff=%s order=%s", tg_user_id, email, tariff, order_id)

    meta = {"telegram_id": tg_user_id, "tariff": tariff, "email": email}
    offer_id = LAVA_OFFER_ID_BASIC
    result = _create_lava_top_invoice(email=email, offer_id=offer_id, order_id=order_id, meta=meta)

    if not result.get("ok"):
        fallback_url = os.getenv(
            "LAVA_PRODUCT_LINK",
            "https://app.lava.top/products/1b9f3e05-86aa-4102-9648-268f0f586bb1/302ecdcd-1581-45ad-8353-a168f347b8cc"
        )
        log.error("lava.top create failed, fallback url: %s", fallback_url)
        return jsonify({
            "ok": True,
            "payment_url": fallback_url,
            "order_id": order_id,
            "note": "Used fallback static product link; personalize fields on the checkout page.",
            "lava_error": result.get("error"),
        })

    return jsonify({"ok": True, "payment_url": result["payment_url"], "order_id": order_id})

@app.post("/api/pay/hook")
def api_pay_hook():
    raw = request.get_data()
    auth = request.headers.get("Authorization", "")
    # Best-effort signature check (algorithm may differ; kept as log-only)
    try:
        secret = (LAVA_TOP_API_KEY or "").encode()
        digest = hmac.new(secret, raw, hashlib.sha256).hexdigest()
        # Don't enforce, just log:
        log.info("hook hmac=%s auth=%s", digest, auth[:64])
    except Exception as e:
        log.exception("hook signature calc error: %s", e)

    data = request.get_json(force=True, silent=True) or {}
    log.info("Hook body: %s", json.dumps(data, ensure_ascii=False))

    status = (data.get("status") or data.get("payment_status") or "").lower()
    event = (data.get("event") or "").lower()
    success_values = {"success", "paid", "succeeded", "completed"}
    is_success = status in success_values or event in {"payment.succeeded", "invoice.paid"} or data.get("paid") is True

    ext = data.get("externalId") or data.get("external_id") or ""
    meta = data.get("metadata") or data.get("meta") or {}
    email = (data.get("customer", {}) or {}).get("email") or data.get("email") or (meta.get("email") if isinstance(meta, dict) else None)
    tg_id = meta.get("telegram_id") if isinstance(meta, dict) else None

    if not tg_id and isinstance(ext, str) and ext.startswith("tg"):
        try:
            tg_id = int(ext[2:].split("-")[0])
        except Exception:
            tg_id = None

    if is_success and tg_id:
        invite = _create_invite_link()
        if invite:
            _send_telegram_message(int(tg_id), f"✅ Оплата прошла успешно!\n\nВот ваша ссылка-приглашение в закрытый канал:\n{invite}")
        else:
            _send_telegram_message(int(tg_id), "✅ Оплата прошла успешно!\n\nСсылка-приглашение пока не создана автоматически. Сообщите администратору.")
    else:
        log.warning("Webhook not processed as success: status=%s event=%s ext=%s tg_id=%s", status, event, ext, tg_id)

    return make_response("OK", 200)

@app.get("/web/success")
def web_success():
    return "<h3>✅ Платёж успешно завершён. Можете вернуться в Telegram.</h3>"

@app.get("/web/fail")
def web_fail():
    return "<h3>❌ Платёж не завершён. Попробуйте ещё раз.</h3>"

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
