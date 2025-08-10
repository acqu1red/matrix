#!/usr/bin/env python3
"""
Webhook handler for Lava Top payments
"""

import json
import hmac
import hashlib
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Lava Top webhook secret (получите в настройках Lava Top)
LAVA_WEBHOOK_SECRET = "your_webhook_secret_here"

# Telegram bot token
TELEGRAM_BOT_TOKEN = "8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo"

# Admin chat IDs
ADMIN_IDS = [708907063, 7365307696]

def verify_webhook_signature(payload, signature):
    """Проверяет подпись webhook от Lava Top"""
    expected_signature = hmac.new(
        LAVA_WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)

def send_telegram_message(chat_id, message):
    """Отправляет сообщение в Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=data)
        return response.status_code == 200
    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")
        return False

@app.route('/lava-webhook', methods=['POST'])
def lava_webhook():
    """Обрабатывает webhook от Lava Top"""
    try:
        # Получаем данные
        payload = request.get_data()
        signature = request.headers.get('X-Signature')
        
        # Проверяем подпись (если настроена)
        if LAVA_WEBHOOK_SECRET != "your_webhook_secret_here":
            if not verify_webhook_signature(payload, signature):
                return jsonify({"error": "Invalid signature"}), 400
        
        # Парсим данные
        data = json.loads(payload)
        
        # Извлекаем информацию о платеже
        payment_status = data.get('status')
        order_id = data.get('order_id')
        amount = data.get('amount')
        currency = data.get('currency')
        metadata = data.get('metadata', {})
        
        user_id = metadata.get('user_id')
        tariff = metadata.get('tariff')
        email = metadata.get('email')
        
        # Формируем сообщение
        if payment_status == 'success':
            message = f"✅ <b>Платеж успешно завершен!</b>\n\n"
            message += f"💰 <b>Сумма:</b> {amount} {currency}\n"
            message += f"🆔 <b>Заказ:</b> {order_id}\n"
            message += f"👤 <b>Пользователь ID:</b> {user_id}\n"
            message += f"💵 <b>Тариф:</b> {tariff}\n"
            message += f"📧 <b>Email:</b> {email}\n\n"
            message += "🎉 Пользователь получил доступ к Формуле Успеха!"
            
            # Отправляем уведомление пользователю
            if user_id:
                send_telegram_message(user_id, 
                    "🎉 <b>Оплата прошла успешно!</b>\n\n"
                    "Добро пожаловать в закрытый канал ФОРМУЛА!\n"
                    "Вы получили доступ ко всем материалам.\n\n"
                    "С уважением, команда Формулы Успеха"
                )
                
        elif payment_status == 'failed':
            message = f"❌ <b>Платеж не прошел</b>\n\n"
            message += f"💰 <b>Сумма:</b> {amount} {currency}\n"
            message += f"🆔 <b>Заказ:</b> {order_id}\n"
            message += f"👤 <b>Пользователь ID:</b> {user_id}\n"
            message += f"💵 <b>Тариф:</b> {tariff}\n"
            message += f"📧 <b>Email:</b> {email}\n\n"
            message += "⚠️ Необходимо связаться с пользователем"
            
        else:
            message = f"ℹ️ <b>Статус платежа изменен</b>\n\n"
            message += f"📊 <b>Новый статус:</b> {payment_status}\n"
            message += f"💰 <b>Сумма:</b> {amount} {currency}\n"
            message += f"🆔 <b>Заказ:</b> {order_id}\n"
            message += f"👤 <b>Пользователь ID:</b> {user_id}"
        
        # Отправляем уведомления администраторам
        for admin_id in ADMIN_IDS:
            send_telegram_message(admin_id, message)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Ошибка обработки webhook: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности webhook"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
