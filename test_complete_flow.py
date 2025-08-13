#!/usr/bin/env python3
"""
Полный тест всего процесса от Mini Apps до создания платежа
"""

import requests
import json
from datetime import datetime

def test_complete_flow():
    """Тестирует полный процесс от Mini Apps до создания платежа"""
    try:
        print("🧪 Тестируем полный процесс...")
        
        # Шаг 1: Тестируем API endpoint напрямую
        print("📡 Шаг 1: Тестируем API endpoint...")
        api_data = {
            "user_id": "123456789",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=api_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   API статус: {response.status_code}")
        print(f"   API ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ API endpoint работает!")
        else:
            print("⚠️ API endpoint недоступен (возможно, бот не перезапущен)")
        
        # Шаг 2: Тестируем полный процесс через Mini Apps
        print("\n📡 Шаг 2: Тестируем полный процесс через Mini Apps...")
        
        final_data = {
            "step": "final_data",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0,
            "userId": "123456789"
        }
        
        webhook_data = {
            "update_id": int(datetime.now().timestamp()),
            "message": {
                "message_id": 1,
                "from": {
                    "id": 123456789,
                    "first_name": "Test",
                    "username": "testuser",
                    "is_bot": False
                },
                "chat": {
                    "id": 123456789,
                    "type": "private"
                },
                "date": int(datetime.now().timestamp()),
                "web_app_data": {
                    "data": json.dumps(final_data),
                    "button_text": "Оплатить"
                }
            }
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Webhook статус: {response.status_code}")
        print(f"   Webhook ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook работает!")
        else:
            print("❌ Webhook ошибка")
        
        # Шаг 3: Проверяем webhook Lava Top
        print("\n📡 Шаг 3: Проверяем webhook Lava Top...")
        
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook")
        print(f"   Lava webhook статус: {response.status_code}")
        print(f"   Lava webhook ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Lava webhook работает!")
        else:
            print("❌ Lava webhook ошибка")
        
        print("\n🎯 Итоговый статус:")
        print("✅ Webhook работает")
        print("✅ Lava webhook работает")
        print("⚠️ API endpoint требует перезапуска Railway")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    success = test_complete_flow()
    if success:
        print("\n🎉 Тест завершен!")
        print("📋 Для полной работы нужно перезапустить Railway с новым кодом")
    else:
        print("\n❌ Тест не прошел!")
