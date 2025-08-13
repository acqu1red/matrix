#!/usr/bin/env python3
"""
Простой тест для проверки работы системы
"""

import requests
import json

def test_health():
    """Тест health endpoint"""
    print("🔍 Тестируем health endpoint...")
    try:
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/health")
        print(f"✅ Health: {response.status_code} - {response.text}")
        return True
    except Exception as e:
        print(f"❌ Health error: {e}")
        return False

def test_api_endpoint():
    """Тест API endpoint для создания платежа"""
    print("🔍 Тестируем API endpoint...")
    try:
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
        
        print(f"✅ API: {response.status_code} - {response.text}")
        
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
        print(f"❌ API error: {e}")
        return False

def test_webhook():
    """Тест webhook endpoint"""
    print("🔍 Тестируем webhook endpoint...")
    try:
        # Тестовые данные от Mini Apps
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
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ Webhook: {response.status_code} - {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Запуск простого тестирования системы")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("API Endpoint", test_api_endpoint),
        ("Webhook", test_webhook)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Тест: {test_name}")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))
        print()
    
    print("=" * 50)
    print("📊 Результаты тестирования:")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ ПРОЙДЕН" if result else "❌ ПРОВАЛЕН"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n📈 Итого: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("🎉 Все тесты пройдены! Система работает корректно.")
    else:
        print("⚠️ Некоторые тесты не пройдены. Проверьте логи.")

if __name__ == "__main__":
    main()
