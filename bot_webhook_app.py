import os
import hmac
import json
import uuid
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
from urllib.parse import parse_qsl

# --- ENV ---
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_PRIVATE_CHANNEL_ID = os.getenv("TELEGRAM_PRIVATE_CHANNEL_ID", "").strip()
TELEGRAM_STATIC_INVITE_LINK = os.getenv("TELEGRAM_STATIC_INVITE_LINK", "").strip()

LAVA_TOP_API_KEY = os.getenv("LAVA_TOP_API_KEY", "").strip()
LAVA_OFFER_ID_BASIC = os.getenv("LAVA_OFFER_ID_BASIC", "").strip()
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").strip()

# Optional storage for subscription info (recommended)
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
SUBSCRIPTION_PERIOD_DAYS = int(os.getenv("SUBSCRIPTION_PERIOD_DAYS", "30"))

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
log = app.logger

# ---- Optional Supabase client ----
_sb = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client
        _sb = create_client(SUPABASE_URL, SUPABASE_KEY)
        log.info("Supabase client initialized")
except Exception as e:
    log.warning("Supabase client not available: %s", e)

# ---- Telegram helpers ----
def _send_telegram_message(chat_id: int, text: str) -> None:
    if not TELEGRAM_BOT_TOKEN:
        log.error("No TELEGRAM_BOT_TOKEN; cannot send Telegram messages")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    r = requests.post(url, json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True})
    if r.status_code >= 300:
        log.error("sendMessage failed %s %s", r.status_code, r.text[:800])

def _create_invite_link() -> str:
    if TELEGRAM_STATIC_INVITE_LINK:
        return TELEGRAM_STATIC_INVITE_LINK
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_PRIVATE_CHANNEL_ID:
        return ""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/createChatInviteLink"
    payload = {"chat_id": TELEGRAM_PRIVATE_CHANNEL_ID, "name": "Оплаченный доступ", "member_limit": 1}
    r = requests.post(url, json=payload, timeout=15)
    if r.ok:
        data = r.json()
        return (data.get("result") or {}).get("invite_link", "")
    log.error("createChatInviteLink failed: %s %s", r.status_code, r.text[:500])
    return ""

# ---- Telegram WebApp initData verification ----
def _verify_telegram_init_data(init_data: str, bot_token: str) -> Optional[dict]:
    try:
        data_pairs = dict(parse_qsl(init_data, strict_parsing=True))
        hash_from_telegram = data_pairs.pop("hash", None)
        items = [f"{k}={data_pairs[k]}" for k in sorted(data_pairs.keys())]
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

# ---- Lava helpers ----
def _pm_and_currency_from_bank(bank: str) -> Tuple[str, str]:
    bank = (bank or "").lower()
    if bank in ("ru", "russian", "bank131"):
        return "BANK131", "RUB"
    return "UNLIMINT", "EUR"

def _create_lava_top_invoice(email: str, offer_id: str, bank: str, tariff: str, tg_user_id: str, order_id: str) -> Dict[str, Any]:
    """
    Create invoice via lava.top API v2.
    POST https://gate.lava.top/api/v2/invoice
    Headers: X-Api-Key: <api_key>
    Body minimal: { email, offerId, currency, paymentMethod, buyerLanguage, clientUtm }
    """
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
    headers = {"X-Api-Key": LAVA_TOP_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
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

# ---- Storage (Supabase) ----
def _store_subscription(tg_id: int, email: str, tariff: str, order_id: str, invite_link: str) -> None:
    if not _sb:
        log.info("Supabase client not set; skipping store_subscription")
        return
    now = datetime.now(timezone.utc)
    next_bill = now + timedelta(days=SUBSCRIPTION_PERIOD_DAYS)
    row = {
        "tg_id": tg_id,
        "email": email,
        "tariff": tariff,
        "order_id": order_id,
        "started_at": now.isoformat(),
        "next_billing_at": next_bill.isoformat(),
        "status": "active",
        "invite_link": invite_link,
    }
    try:
        _sb.table("subscriptions").upsert(row, on_conflict="tg_id").execute()
    except Exception as e:
        log.warning("Supabase upsert failed: %s", e)

def _get_subscription(tg_id: int) -> Optional[dict]:
    if not _sb:
        return None
    try:
        res = _sb.table("subscriptions").select("*").eq("tg_id", tg_id).limit(1).execute()
        data = (res.data or [])
        return data[0] if data else None
    except Exception as e:
        log.warning("Supabase select failed: %s", e)
        return None

# ---- Routes ----
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

    result = _create_lava_top_invoice(email=email, offer_id=LAVA_OFFER_ID_BASIC, bank=bank, tariff=tariff, tg_user_id=tg_user_id, order_id=order_id)

    if not result.get("ok"):
        fallback_url = os.getenv("LAVA_PRODUCT_LINK", "https://app.lava.top/")
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
    # Expect JSON with fields including eventType/status and clientUtm
    data = request.get_json(force=True, silent=True) or {}
    log.info("Hook body: %s", json.dumps(data, ensure_ascii=False))

    event_type = (data.get("eventType") or "").lower()
    status = (data.get("status") or "").lower()
    success = event_type in ("payment.success", "subscription.recurring.payment.success") or status in ("completed", "subscription-active")

    client_utm = data.get("clientUtm") or {}
    # Support different key casings
    def g(keys, d):
        for k in keys:
            if k in d:
                return d[k]
        return None
    utm_source = g(["utm_source", "utmSource"], client_utm) or ""
    utm_content = g(["utm_content", "utmContent"], client_utm) or ""

    tg_id = None
    if isinstance(utm_source, str) and utm_source.startswith("tg_"):
        try:
            tg_id = int(utm_source.split("_", 1)[1])
        except Exception:
            tg_id = None

    # try also to read email/tariff if present
    email = data.get("email") or (data.get("customer", {}) or {}).get("email") or ""
    tariff = g(["utm_campaign", "utmCampaign"], client_utm) or "basic"

    if success and tg_id:
        invite = _create_invite_link() or ""
        if invite:
            _send_telegram_message(int(tg_id), f"✅ Оплата прошла успешно!\n\nВот ваша ссылка-приглашение в закрытый канал:\n{invite}")
        else:
            _send_telegram_message(int(tg_id), "✅ Оплата прошла успешно! Мы не смогли сгенерировать инвайт автоматически, напишите администратору.")
        try:
            _store_subscription(int(tg_id), email, tariff, utm_content or "", invite)
        except Exception as e:
            log.warning("store_subscription error: %s", e)
    else:
        log.warning("Webhook ignored: eventType=%s status=%s utm=%s", event_type, status, client_utm)

    return make_response("OK", 200)

@app.post("/api/subscription")
def api_subscription():
    # Accept init_data or telegram_id, return subscription info for menu
    body = request.get_json(force=True, silent=True) or {}
    tg_user_id = body.get("telegram_id")
    if not tg_user_id and body.get("init_data"):
        parsed = _verify_telegram_init_data(body["init_data"], TELEGRAM_BOT_TOKEN)
        if parsed and isinstance(parsed.get("user"), dict):
            tg_user_id = parsed["user"].get("id")
    if not tg_user_id:
        return jsonify({"ok": False, "error": "telegram_id or init_data required"}), 400

    info = _get_subscription(int(tg_user_id)) if _sb else None
    # compute derived fields
    if info:
        now = datetime.now(timezone.utc)
        started_at = datetime.fromisoformat(info["started_at"])
        next_bill = datetime.fromisoformat(info["next_billing_at"]) if info.get("next_billing_at") else None
        # days and hours remaining
        remaining = None
        if next_bill:
            delta = next_bill - now
            remaining = {"days": max(0, delta.days), "hours": max(0, int(delta.seconds/3600))}
        return jsonify({"ok": True, "has_subscription": True, "data": {
            "email": info.get("email"),
            "tg_id": info.get("tg_id"),
            "tariff": info.get("tariff"),
            "started_at": info.get("started_at"),
            "next_billing_at": info.get("next_billing_at"),
            "remaining": remaining,
            "invite_link": info.get("invite_link"),
        }})

    # No stored info
    return jsonify({"ok": True, "has_subscription": False, "data": None})

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)