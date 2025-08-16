# -*- coding: utf-8 -*-
import os, hmac, json, uuid, hashlib, logging, requests
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from urllib.parse import parse_qsl

VERSION = "v2.6-2025-08-16-submenu"

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN","").strip()
TELEGRAM_PRIVATE_CHANNEL_ID = os.getenv("TELEGRAM_PRIVATE_CHANNEL_ID","").strip()
TELEGRAM_STATIC_INVITE_LINK = os.getenv("TELEGRAM_STATIC_INVITE_LINK","").strip()
LAVA_TOP_API_KEY = os.getenv("LAVA_TOP_API_KEY","").strip()
LAVA_OFFER_ID_BASIC = os.getenv("LAVA_OFFER_ID_BASIC","").strip()
SUBSCRIPTION_PERIOD_DAYS = int(os.getenv("SUBSCRIPTION_PERIOD_DAYS","30"))
SUPABASE_URL = os.getenv("SUPABASE_URL","").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY","").strip()

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
log = app.logger
log.info("=== FORMULA BACKEND %s ===", VERSION)

def _verify_telegram_init_data(init_data: str, bot_token: str) -> Optional[dict]:
    try:
        data_pairs = dict(parse_qsl(init_data, strict_parsing=True))
        hash_from_telegram = data_pairs.pop("hash", None)
        items = [f"{k}={data_pairs[k]}" for k in sorted(data_pairs.keys())]
        dcs = "\n".join(items)
        secret_key = hashlib.sha256(("WebAppData" + bot_token).encode()).digest()
        h = hmac.new(secret_key, dcs.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(h, (hash_from_telegram or "")):
            log.warning("init_data HMAC mismatch")
            return None
        if "user" in data_pairs:
            data_pairs["user"] = json.loads(data_pairs["user"])
        return data_pairs
    except Exception as e:
        log.exception("init_data validation failed: %s", e)
        return None

def _pm_and_currency(bank: str) -> Tuple[str, str]:
    bank = (bank or "").lower()
    if bank in ("ru", "russian", "bank131"):
        return "BANK131", "RUB"
    return "UNLIMINT", "EUR"

def _create_invoice_v2(email: str, offer_id: str, bank: str, tariff: str, tg_user_id: str, order_id: str, username: Optional[str]) -> Dict[str, Any]:
    pm, currency = _pm_and_currency(bank)
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
            "utm_content": order_id,
            "utm_term": username or ""
        }
    }
    headers = {"X-Api-Key": LAVA_TOP_API_KEY, "Content-Type":"application/json", "Accept":"application/json"}
    url = "https://gate.lava.top/api/v2/invoice"
    log.info("→ v2 invoice: %s", json.dumps(payload, ensure_ascii=False))
    r = requests.post(url, headers=headers, json=payload, timeout=25)
    log.info("← v2 status=%s body=%s", r.status_code, r.text[:2000])
    try:
        data = r.json()
    except Exception:
        data = {}
    if r.ok:
        return {"ok": True, "payment_url": data.get("url") or data.get("payUrl") or data.get("paymentUrl"), "currency": payload["currency"], "bank": pm}
    return {"ok": False, "error": data or {"status_code": r.status_code, "body": r.text[:1000]}}

def _supabase_upsert_subscription(rec: Dict[str, Any]) -> None:
    if not (SUPABASE_URL and SUPABASE_KEY):
        log.warning("Supabase not configured; skipping store")
        return
    url = f"{SUPABASE_URL}/rest/v1/subscriptions"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"}
    try:
        rr = requests.post(url, headers=headers, data=json.dumps(rec), timeout=20)
        if rr.status_code >= 300:
            log.error("Supabase upsert failed %s %s", rr.status_code, rr.text[:500])
    except Exception as e:
        log.error("Supabase upsert exception: %s", e)

def _supabase_fetch_subscription(tg_id: int) -> Optional[Dict[str, Any]]:
    if not (SUPABASE_URL and SUPABASE_KEY):
        return None
    url = f"{SUPABASE_URL}/rest/v1/subscriptions"
    params = {"tg_id": f"eq.{tg_id}", "select": "*", "limit": "1"}
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        rr = requests.get(url, headers=headers, params=params, timeout=15)
        if rr.ok:
            arr = rr.json()
            if isinstance(arr, list) and arr:
                return arr[0]
    except Exception as e:
        log.error("Supabase fetch exception: %s", e)
    return None

def _send_tg(chat_id: int, text: str) -> None:
    if not TELEGRAM_BOT_TOKEN:
        log.error("No TELEGRAM_BOT_TOKEN; cannot send Telegram messages")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    r = requests.post(url, json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True}, timeout=20)
    if not r.ok:
        log.error("sendMessage failed %s %s", r.status_code, r.text[:500])

def _create_invite_link() -> str:
    if TELEGRAM_STATIC_INVITE_LINK:
        return TELEGRAM_STATIC_INVITE_LINK
    if not (TELEGRAM_BOT_TOKEN and TELEGRAM_PRIVATE_CHANNEL_ID):
        return ""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/createChatInviteLink"
    payload = {"chat_id": TELEGRAM_PRIVATE_CHANNEL_ID, "name": "Оплаченный доступ", "member_limit": 1}
    r = requests.post(url, json=payload, timeout=20)
    if r.ok:
        data = r.json()
        return (data.get("result") or {}).get("invite_link","")
    log.error("createChatInviteLink failed %s %s", r.status_code, r.text[:500])
    return ""

from flask import jsonify

@app.get("/health")
def health():
    return {"ok": True, "version": VERSION}

@app.post("/api/pay/create")
def api_pay_create():
    try:
        body = request.get_json(force=True, silent=False) or {}
        tg_user_id = str(body.get("telegram_id") or "").strip()
        init_data = body.get("init_data")
        username = (body.get("username") or "").strip() or None

        if not tg_user_id and init_data:
            parsed = _verify_telegram_init_data(init_data, TELEGRAM_BOT_TOKEN)
            if parsed and isinstance(parsed.get("user"), dict):
                tg_user_id = str(parsed["user"].get("id") or "")
                if not username:
                    username = parsed["user"].get("username")

        email = str(body.get("email", "")).strip().lower()
        tariff = str(body.get("tariff", "")).strip().lower() or "basic"
        bank = str(body.get("bank", "")).strip().lower() or "russian"
        if not tg_user_id or not email:
            return jsonify({"ok": False, "error": "telegram_id/init_data и email обязательны"}), 400

        order_id = f"tg{tg_user_id}-{uuid.uuid4().hex[:12]}"
        log.info("Create pay: tg=%s email=%s tariff=%s order=%s bank=%s", tg_user_id, email, tariff, order_id, bank)

        res = _create_invoice_v2(email=email, offer_id=LAVA_OFFER_ID_BASIC, bank=bank, tariff=tariff, tg_user_id=tg_user_id, order_id=order_id, username=username)
        if not res.get("ok"):
            return jsonify({"ok": False, "error": f"lava invoice error: {res.get('error')}", "order_id": order_id}), 502

        return jsonify({"ok": True, "payment_url": res["payment_url"], "order_id": order_id})
    except Exception as e:
        log.exception("api_pay_create crashed: %s", e)
        return jsonify({"ok": False, "error": f"server exception: {e}"}), 500

@app.post("/api/pay/hook")
def api_pay_hook():
    data = request.get_json(force=True, silent=True) or {}
    log.info("Hook body: %s", json.dumps(data, ensure_ascii=False))

    event_type = (data.get("eventType") or "").lower()
    status = (data.get("status") or "").lower()
    success = event_type in ("payment.success", "subscription.recurring.payment.success") or status in ("completed", "subscription-active")

    client_utm = data.get("clientUtm") or {}
    utm_source = client_utm.get("utm_source") or client_utm.get("utmSource") or ""
    utm_campaign = client_utm.get("utm_campaign") or client_utm.get("utmCampaign") or ""
    utm_content = client_utm.get("utm_content") or client_utm.get("utmContent") or ""
    utm_term = client_utm.get("utm_term") or client_utm.get("utmTerm") or ""

    tg_id = None
    if isinstance(utm_source, str) and utm_source.startswith("tg_"):
        try:
            tg_id = int(utm_source.split("_", 1)[1])
        except Exception:
            tg_id = None

    if success and tg_id:
        email = data.get("email") or (data.get("customer") or {}).get("email") or ""
        currency = data.get("currency") or ""
        now = datetime.utcnow()
        period = SUBSCRIPTION_PERIOD_DAYS
        rec = {
            "tg_id": tg_id,
            "username": utm_term or None,
            "email": email or None,
            "tariff": utm_campaign or "basic",
            "bank": None,
            "currency": currency or None,
            "order_id": utm_content or None,
            "started_at": now.isoformat()+"Z",
            "next_payment_at": (now + timedelta(days=period)).isoformat()+"Z",
            "expires_at": (now + timedelta(days=period)).isoformat()+"Z"
        }
        _supabase_upsert_subscription(rec)

        invite = _create_invite_link() or ""
        if invite:
            _send_tg(int(tg_id), f"✅ Оплата прошла успешно!\n\nВот ваша ссылка-приглашение в закрытый канал:\n{invite}")
        else:
            _send_tg(int(tg_id), "✅ Оплата прошла успешно! Но не удалось создать инвайт автоматически, напишите администратору.")
    else:
        log.warning("Webhook ignored: eventType=%s status=%s utm=%s", event_type, status, client_utm)

    return make_response("OK", 200)

@app.post("/api/subscription/status")
def api_subscription_status():
    body = request.get_json(force=True, silent=True) or {}
    tg_user_id = body.get("telegram_id")
    init_data = body.get("init_data")
    if not tg_user_id and init_data:
        parsed = _verify_telegram_init_data(init_data, TELEGRAM_BOT_TOKEN)
        if parsed and isinstance(parsed.get("user"), dict):
            tg_user_id = parsed["user"].get("id")
    if not tg_user_id:
        return jsonify({"ok": False, "error": "telegram_id или init_data обязателен"}), 400
    try:
        tg_user_id = int(tg_user_id)
    except:
        return jsonify({"ok": False, "error": "invalid telegram_id"}), 400

    row = _supabase_fetch_subscription(tg_user_id)
    if not row:
        return jsonify({"ok": True, "has_subscription": False, "channel_invite_link": TELEGRAM_STATIC_INVITE_LINK})
    return jsonify({"ok": True, "has_subscription": True, "data": row, "channel_invite_link": TELEGRAM_STATIC_INVITE_LINK})

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)