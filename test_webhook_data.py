#!/usr/bin/env python3
"""
Тест для проверки получения данных от Mini Apps
"""

import requests
import json

def test_webhook_with_mini_apps_data():
    """Тест webhook с данными от Mini Apps"""
    print("🔍 Тестируем webhook с данными от Mini Apps...")
    
    # Данные, которые отправляет Mini Apps
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
            "date": 1234567890,
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
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ Webhook ответ: {response.status_code} - {response.text}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Ошибка webhook: {e}")
        return False

def test_api_endpoint():
    """Тест API endpoint"""
    print("🔍 Тестируем API endpoint...")
    
    data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ API ответ: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            payment_url = result.get('payment_url')
            if payment_url:
                print(f"✅ Ссылка создана: {payment_url}")
                return True
            else:
                print("❌ Ссылка не найдена в ответе")
                return False
        else:
            print(f"❌ API вернул ошибку: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API: {e}")
        return False

def main():
    """Основная функция"""
    print("🚀 Тестирование системы...")
    print("=" * 50)
    
    # Тест 1: Webhook с данными от Mini Apps
    print("\n🧪 Тест 1: Webhook с данными от Mini Apps")
    result1 = test_webhook_with_mini_apps_data()
    
    # Тест 2: API endpoint
    print("\n🧪 Тест 2: API endpoint")
    result2 = test_api_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 РЕЗУЛЬТАТЫ:")
    print("=" * 50)
    print(f"Webhook с Mini Apps: {'✅ РАБОТАЕТ' if result1 else '❌ НЕ РАБОТАЕТ'}")
    print(f"API endpoint: {'✅ РАБОТАЕТ' if result2 else '❌ НЕ РАБОТАЕТ'}")
    
    if result1 and result2:
        print("\n🎉 Все тесты пройдены! Система работает!")
    else:
        print("\n⚠️ Есть проблемы. Проверьте логи Railway.")

if __name__ == "__main__":
    main()
