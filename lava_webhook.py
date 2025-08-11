#!/usr/bin/env python3
"""
Webhook handler for Lava Top payments
"""

import json
import hmac
import hashlib
import os
from flask import Flask, request, jsonify
import requests
from datetime import datetime, timedelta
from supabase import create_client, Client
from email_service import email_service

app = Flask(__name__)

# Lava Top webhook secret (получите в настройках Lava Top)
LAVA_WEBHOOK_SECRET = os.getenv('LAVA_WEBHOOK_SECRET', 'your_webhook_secret_here')

# Telegram bot token
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo')

# Admin chat IDs
ADMIN_IDS = [708907063, 7365307696]

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://uhhsrtmmuwoxsdquimaa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        bank = metadata.get('bank')
        
        # Формируем сообщение
        if payment_status == 'success':
            # Создаем подписку в базе данных
            subscription_id = create_subscription(user_id, email, tariff, amount, currency, order_id, metadata)
            
            # Отправляем приглашение на email
            if subscription_id and email:
                send_channel_invitation(user_id, email, tariff, subscription_id)
            
            message = f"✅ <b>Платеж успешно завершен!</b>\n\n"
            message += f"💰 <b>Сумма:</b> {amount} {currency}\n"
            message += f"🆔 <b>Заказ:</b> {order_id}\n"
            message += f"👤 <b>Пользователь ID:</b> {user_id}\n"
            message += f"💵 <b>Тариф:</b> {tariff}\n"
            message += f"📧 <b>Email:</b> {email}\n"
            message += f"🏦 <b>Банк:</b> {bank}\n\n"
            message += "🎉 Подписка создана, приглашение отправлено на email!"
            
            # Отправляем уведомление пользователю с ссылкой-приглашением
            if user_id:
                invite_link = "https://t.me/+6SQb4RwwAmZlMWQ6"
                send_telegram_message(user_id, 
                    f"🎉 <b>Оплата прошла успешно!</b>\n\n"
                    f"Ваша подписка активирована!\n"
                    f"Вот ваша ссылка для доступа к закрытому каналу:\n\n"
                    f"🔗 <a href='{invite_link}'>Присоединиться к каналу</a>\n\n"
                    f"📧 Также проверьте email - там подробная информация.\n\n"
                    f"С уважением, команда Формулы Успеха"
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

def create_subscription(user_id, email, tariff, amount, currency, order_id, metadata):
    """Создает подписку в базе данных"""
    try:
        # Определяем цены в зависимости от валюты
        if currency == 'RUB':
            price_rub = int(float(amount))
            price_eur = round(float(amount) / 111.0, 2)  # 1 EUR ≈ 111 RUB
        else:  # EUR
            price_eur = float(amount)
            price_rub = int(float(amount) * 111.0)
        
        # Вычисляем дату окончания подписки
        end_date = datetime.now()
        if tariff == '1_month':
            end_date += timedelta(days=30)
        elif tariff == '6_months':
            end_date += timedelta(days=180)
        elif tariff == '12_months':
            end_date += timedelta(days=365)
        
        # Создаем подписку
        subscription_data = {
            'user_id': int(user_id),
            'email': email,
            'tariff': tariff,
            'price_rub': price_rub,
            'price_eur': price_eur,
            'payment_status': 'completed',
            'subscription_status': 'active',
            'end_date': end_date.isoformat(),
            'order_id': order_id,
            'payment_data': metadata
        }
        
        result = supabase.table('subscriptions').insert(subscription_data).execute()
        
        if result.data:
            subscription_id = result.data[0]['id']
            print(f"✅ Подписка создана: ID {subscription_id}")
            return subscription_id
        else:
            print("❌ Ошибка создания подписки")
            return None
            
    except Exception as e:
        print(f"❌ Ошибка создания подписки: {e}")
        return None

def send_channel_invitation(user_id, email, tariff, subscription_id):
    """Отправляет приглашение в канал на email"""
    try:
        # Получаем информацию о подписке
        result = supabase.table('subscriptions').select('*').eq('id', subscription_id).execute()
        
        if result.data:
            subscription = result.data[0]
            end_date = datetime.fromisoformat(subscription['end_date'])
            
            # Отправляем email
            success = email_service.send_channel_invitation(
                email=email,
                user_name=f"Пользователь {user_id}",
                tariff=tariff,
                end_date=end_date
            )
            
            if success:
                # Обновляем статус отправки приглашения
                supabase.table('subscriptions').update({
                    'channel_invite_sent': True,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', subscription_id).execute()
                
                print(f"✅ Приглашение отправлено на {email}")
            else:
                print(f"❌ Ошибка отправки приглашения на {email}")
                
    except Exception as e:
        print(f"❌ Ошибка отправки приглашения: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности webhook"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
