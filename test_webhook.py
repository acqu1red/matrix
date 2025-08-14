#!/usr/bin/env python3
"""
Тест для проверки работы webhook
"""

import requests
import json

def test_webhook():
    """Тестирует webhook endpoint"""
    try:
        print("🧪 Тестируем webhook endpoint...")
        
        # Тестируем GET запрос
        print("📡 Тестируем GET запрос...")
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook")
        print(f"   GET статус: {response.status_code}")
        print(f"   GET ответ: {response.text}")
        print()
        
        # Тестируем POST запрос с тестовыми данными
        print("📡 Тестируем POST запрос...")
        test_data = {
            "status": "success",
            "order_id": "test_order_123",
            "amount": 5000,
            "currency": "RUB",
            "metadata": {
                "user_id": "123456789",
                "telegram_id": "123456789",
                "tariff": "1_month",
                "email": "test@example.com"
            }
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   POST статус: {response.status_code}")
        print(f"   POST ответ: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Ошибка тестирования webhook: {e}")
        return False

if __name__ == '__main__':
    success = test_webhook()
    if success:
        print("✅ Webhook тест прошел успешно!")
    else:
        print("❌ Webhook тест не прошел!")
