import os
import hmac
import json
import uuid
import hashlib
import logging
from typing import Dict, Any, Optional, Tuple
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
from urllib.parse import parse_qsl, unquote_plus

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

def _verify_telegram_init_data(init_data: str, bot_token: str) -> Optional[dict]:
    try:
        data_pairs = dict(parse_qsl(init_data, strict_parsing=True))
        hash_from_telegram = data_pairs.pop("hash", None)
        items = []
        for k in sorted(data_pairs.keys()):
            items.append(f"{k}={data_pairs[k]}")
        data_check_string = "\n".join(items)
        secret_key = hashlib.sha256(("WebAppData" + bot_token).encode()).digest()
        hmac_string = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(hmac_string, (hash_from_telegram or "")):
            log.warning("init_data HMAC mismatch")
            return None
        if "user" in data_pairs:
            data_pairs["user"] = json.loads(data_pairs["user"])
        return data_pairs
    except Exception as e:
        log.exception("init_data validation failed: %s", e)
        return None

def _send_telegram_message(chat_id: int, text: str) -> None:
    if not TELEGRAM_BOT_TOKEN:
        log.error("No TELEGRAM_BOT_TOKEN; cannot send Telegram messages")
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

def _pm_and_currency_from_bank(bank: str) -> Tuple[str, str]:
    bank = (bank or "").lower()
    if bank in ("ru", "russian", "bank131"):
        return "BANK131", "RUB"
    return "UNLIMINT", "EUR"

def _create_lava_top_invoice(email: str, offer_id: str, bank: str, tariff: str, tg_user_id: str, order_id: str) -> Dict[str, Any]:
    pm, currency = _pm_and_currency_from_bank(bank)
    payload = {
        "email": email,
        "offerId": offer_id,
        "currency": currency,
        "paymentMethod": pm,
        "buyerLanguage": "RU",
        "clientUtm": {
            "utm_source": f"tg_{tg_user_id}",
            "utm_medium": "bot",
            "utm_campaign": tariff or "basic",
            "utm_content": order_id
        }
    }
    headers = {
        "X-Api-Key": LAVA_TOP_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    url = "https://gate.lava.top/api/v2/invoice"
    log.info("→ lava.top create invoice req: %s", json.dumps(payload, ensure_ascii=False))
    r = requests.post(url, headers=headers, json=payload, timeout=25)
    body_text = r.text[:2000]
    log.info("← lava.top resp %s: %s", r.status_code, body_text)
    try:
        data = r.json()
    except Exception:
        data = {}
    if r.ok:
        payment_url = data.get("url") or data.get("payUrl") or data.get("paymentUrl")
        return {"ok": True, "payment_url": payment_url, "raw": data}
    else:
        return {"ok": False, "error": data or {"status_code": r.status_code, "body": body_text}}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/api/pay/create")
def api_pay_create():
    body = request.get_json(force=True, silent=False) or {}
    tg_user_id = str(body.get("telegram_id") or "").strip()
    init_data = body.get("init_data")
    if not tg_user_id and init_data:
        parsed = _verify_telegram_init_data(init_data, TELEGRAM_BOT_TOKEN)
        if parsed and isinstance(parsed.get("user"), dict):
            tg_user_id = str(parsed["user"].get("id") or "")
    email = str(body.get("email", "")).strip().lower()
    tariff = str(body.get("tariff", "")).strip().lower() or "basic"
    bank = str(body.get("bank", "")).strip().lower() or "russian"
    if not tg_user_id or not email:
        return jsonify({"ok": False, "error": "telegram_id or init_data and email are required"}), 400

    order_id = f"tg{tg_user_id}-{uuid.uuid4().hex[:12]}"
    log.info("Create pay: tg=%s email=%s tariff=%s bank=%s order=%s", tg_user_id, email, tariff, bank, order_id)
    if not PUBLIC_BASE_URL:
        return jsonify({"ok": False, "error": "PUBLIC_BASE_URL env is not set"}), 500

    offer_id = LAVA_OFFER_ID_BASIC
    result = _create_lava_top_invoice(email=email, offer_id=offer_id, bank=bank, tariff=tariff, tg_user_id=tg_user_id, order_id=order_id)

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
            "note": "Used fallback static product link (invoice API returned error).",
            "lava_error": result.get("error"),
        })

    return jsonify({"ok": True, "payment_url": result["payment_url"], "order_id": order_id})

@app.post("/api/pay/hook")
def api_pay_hook():
    data = request.get_json(force=True, silent=True) or {}
    log.info("Hook body: %s", json.dumps(data, ensure_ascii=False))
    event_type = (data.get("eventType") or "").lower()
    status = (data.get("status") or "").lower()
    success = event_type in ("payment.success", "subscription.recurring.payment.success") or status in ("completed", "subscription-active")
    client_utm = data.get("clientUtm") or {}
    tg_id = None
    for key in ("utmSource", "utm_source", "utm_term", "utmTerm", "utm_content", "utmContent"):
        val = client_utm.get(key)
        if isinstance(val, str) and val.startswith("tg_"):
            try:
                tg_id = int(val.split("_", 1)[1])
                break
            except Exception:
                pass
    if success and tg_id:
        invite = _create_invite_link() or ""
        if invite:
            _send_telegram_message(int(tg_id), f"✅ Оплата прошла успешно!\n\nВот ваша ссылка-приглашение в закрытый канал:\n{invite}")
        else:
            _send_telegram_message(int(tg_id), "✅ Оплата прошла успешно! Мы не смогли сгенерировать инвайт автоматически, напишите администратору.")
    else:
        log.warning("Webhook ignored: eventType=%s status=%s clientUtm=%s", event_type, status, client_utm)
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