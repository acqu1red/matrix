#!/usr/bin/env python3
"""
Тест текущей работы системы
"""

import requests
import json

def test_current_system():
    """Тестирует текущую работу системы"""
    try:
        print("🧪 Тестируем текущую работу системы...")
        
        # Данные от Mini Apps
        mini_apps_data = {
            "step": "final_data",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0,
            "userId": "123456789"
        }
        
        print(f"📤 Отправляем данные: {json.dumps(mini_apps_data, indent=2)}")
        
        # Отправляем данные в webhook (как в тестах)
        webhook_data = {
            "update_id": 123456789,
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
                "date": 1755091200,
                "web_app_data": {
                    "data": json.dumps(mini_apps_data),
                    "button_text": "Оплатить"
                }
            }
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Статус ответа: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook ответил успешно!")
            return True
        else:
            print(f"❌ Webhook ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

def test_api_endpoint():
    """Тестирует API endpoint"""
    try:
        print("🧪 Тестируем API endpoint...")
        
        data = {
            "user_id": "123456789",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 API статус: {response.status_code}")
        print(f"📡 API ответ: {response.text}")
        
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
            print(f"❌ API ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API: {e}")
        return False

def main():
    """Основная функция"""
    print("🚀 Тестирование текущей системы")
    print("=" * 50)
    
    # Тестируем API endpoint
    print("\n📋 Тест 1: API Endpoint")
    print("-" * 30)
    api_success = test_api_endpoint()
    
    # Тестируем webhook
    print("\n📋 Тест 2: Webhook")
    print("-" * 30)
    webhook_success = test_current_system()
    
    print("\n" + "=" * 50)
    print("📊 Результаты:")
    print(f"API Endpoint: {'✅ РАБОТАЕТ' if api_success else '❌ НЕ РАБОТАЕТ'}")
    print(f"Webhook: {'✅ РАБОТАЕТ' if webhook_success else '❌ НЕ РАБОТАЕТ'}")
    
    if api_success and webhook_success:
        print("\n🎉 Система работает! Проблема может быть в Mini Apps.")
    else:
        print("\n⚠️ Есть проблемы в системе.")

if __name__ == "__main__":
    main()
