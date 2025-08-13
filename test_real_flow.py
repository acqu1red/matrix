#!/usr/bin/env python3
"""
Тест полного цикла с реальными данными от Mini Apps
"""

import requests
import json
from datetime import datetime

def test_real_mini_apps_flow():
    """Тестирует полный цикл с реальными данными от Mini Apps"""
    print("🧪 Тестируем полный цикл с реальными данными от Mini Apps...")
    
    # Тестовые данные, которые отправляет Mini Apps
    webhook_data = {
        "update_id": 123456789,
        "message": {
            "message_id": 1,
            "from": {
                "id": 123456789,
                "is_bot": False,
                "first_name": "Test",
                "username": "testuser"
            },
            "chat": {
                "id": 123456789,
                "type": "private"
            },
            "date": int(datetime.now().timestamp()),
            "web_app_data": {
                "data": json.dumps({
                    "step": "final_data",
                    "email": "test@example.com",
                    "tariff": "1_month",
                    "price": 50.0,
                    "userId": "123456789"
                }),
                "button_text": "Оплатить"
            }
        }
    }
    
    print(f"📤 Отправляем данные от Mini Apps: {json.dumps(webhook_data, indent=2)}")
    
    # Отправляем запрос к webhook
    webhook_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
    
    try:
        response = requests.post(
            webhook_url,
            json=webhook_data,
            headers={
                "Content-Type": "application/json",
                "X-Telegram-Bot-Api-Secret-Token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c"
            },
            timeout=30
        )
        
        print(f"📡 Webhook ответ: {response.status_code}")
        print(f"📡 Webhook текст: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook обработан успешно!")
            return True
        else:
            print(f"❌ Webhook ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка webhook запроса: {e}")
        return False

def test_api_endpoint_direct():
    """Тестирует API endpoint напрямую"""
    print("\n🧪 Тестируем API endpoint напрямую...")
    
    test_data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    api_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment"
    
    try:
        response = requests.post(
            api_url,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 API ответ: {response.status_code}")
        print(f"📡 API текст: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            payment_url = result.get('payment_url')
            if payment_url:
                print(f"✅ API endpoint работает! URL: {payment_url}")
                return True
            else:
                print("❌ URL не найден в ответе")
                return False
        else:
            print(f"❌ API ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API запроса: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Запуск тестов полного цикла...")
    
    # Тест 1: API endpoint
    api_success = test_api_endpoint_direct()
    
    # Тест 2: Mini Apps webhook
    webhook_success = test_real_mini_apps_flow()
    
    print("\n" + "=" * 60)
    print("🎯 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:")
    print("=" * 60)
    print(f"✅ API endpoint: {'РАБОТАЕТ' if api_success else 'НЕ РАБОТАЕТ'}")
    print(f"✅ Mini Apps webhook: {'РАБОТАЕТ' if webhook_success else 'НЕ РАБОТАЕТ'}")
    
    if api_success and webhook_success:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
        print("🚀 Система готова к работе!")
    else:
        print("\n⚠️ Есть проблемы, которые нужно исправить")
