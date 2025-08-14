#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы Lava Top API
"""

import os
import requests
import json
from datetime import datetime

# Lava Top конфигурация
LAVA_SHOP_ID = os.getenv('LAVA_SHOP_ID', '1b9f3e05-86aa-4102-9648-268f0f586bb1')
LAVA_SECRET_KEY = os.getenv('LAVA_SECRET_KEY', 'whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav')

def test_lava_api():
    """Тестирует создание инвойса через Lava Top API"""
    try:
        print("🧪 Тестируем Lava Top API...")
        print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
        print(f"🔑 LAVA_SECRET_KEY: {LAVA_SECRET_KEY[:20]}...")
        
        # Данные для инвойса
        invoice_data = {
            "shop_id": LAVA_SHOP_ID,
            "amount": 5000,  # 50 RUB в копейках
            "currency": "RUB",
            "order_id": f"test_order_{int(datetime.now().timestamp())}",
            "hook_url": f"https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook",
            "success_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
            "fail_url": "https://t.me/+6SQb4RwwAmZlMWQ6",
            "metadata": {
                "user_id": "123456789",
                "telegram_id": "123456789",
                "tariff": "1_month",
                "email": "test@example.com"
            }
        }
        
        print(f"📤 Данные инвойса: {json.dumps(invoice_data, indent=2)}")
        
        # Отправляем запрос к Lava Top API
        api_url = "https://lava.top/api/invoice/create"
        headers = {
            "Authorization": f"Bearer {LAVA_SECRET_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        print(f"📡 Отправляем запрос к: {api_url}")
        print(f"📡 Headers: {headers}")
        
        response = requests.post(api_url, json=invoice_data, headers=headers)
        print(f"📡 Ответ API: {response.status_code}")
        print(f"📡 Ответ текст: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Успешный ответ: {json.dumps(result, indent=2)}")
            
            # Получаем URL для оплаты
            payment_url = result.get('data', {}).get('url')
            if payment_url:
                print(f"🔗 URL для оплаты: {payment_url}")
                return True
            else:
                print(f"❌ URL не найден в ответе")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования API: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    success = test_lava_api()
    if success:
        print("✅ Тест Lava Top API прошел успешно!")
    else:
        print("❌ Тест Lava Top API не прошел!")
