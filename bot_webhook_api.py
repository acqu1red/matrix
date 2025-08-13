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
TARGET_CHANNEL_ID = int(os.getenv("TARGET_CHANNEL_ID", "0"))  # например: -1001234567890
STATIC_INVITE_LINK = os.getenv("STATIC_INVITE_LINK")  # если не задано, создаём одноразовую ссылку

# Создаем Flask приложение
app = Flask(__name__)

# Для подписи запросов (часть интеграций LAVA требует HMAC; оставляем гибко)
def _lava_signature(body: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()

def _lava_headers(body: str) -> dict:
    # Встречаются 2 варианта авторизации у платёжек: Bearer и/или HMAC-подпись тела
    # Оставляем оба — если твоя интеграция не требует подписи, сервер просто проигнорирует.
    return {
        "Authorization": f"Bearer {LAVA_API_KEY}",
        "Content-Type": "application/json",
        "X-Signature": _lava_signature(body, LAVA_API_KEY),
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
