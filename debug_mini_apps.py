#!/usr/bin/env python3
"""
Отладочный скрипт для проверки Mini Apps данных
"""

import requests
import json
from datetime import datetime

def test_mini_apps_webhook():
    """Тестирует webhook с данными от Mini Apps"""
    print("🧪 Тестируем webhook с данными от Mini Apps...")
    
    # Данные от Mini Apps (точно как в работающих тестах)
    mini_apps_data = {
        "step": "final_data",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0,
        "userId": "123456789"
    }
    
    # Структура webhook данных (точно как в работающих тестах)
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
    
    print(f"📤 Отправляем webhook данные:")
    print(json.dumps(webhook_data, indent=2))
    
    try:
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

def test_webhook_info():
    """Проверяет информацию о webhook"""
    print("🔍 Проверяем информацию о webhook...")
    
    try:
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info")
        print(f"✅ Webhook info: {response.status_code}")
        print(f"📋 Информация: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

def test_health():
    """Проверяет health endpoint"""
    print("🔍 Проверяем health endpoint...")
    
    try:
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/health")
        print(f"✅ Health: {response.status_code} - {response.text}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

def test_api_endpoint():
    """Тестирует API endpoint"""
    print("🧪 Тестируем API endpoint...")
    
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
    print("🚀 Отладка Mini Apps системы")
    print("=" * 50)
    print(f"⏰ Время: {datetime.now()}")
    print()
    
    # Тестируем все компоненты
    tests = [
        ("Health Check", test_health),
        ("Webhook Info", test_webhook_info),
        ("API Endpoint", test_api_endpoint),
        ("Mini Apps Webhook", test_mini_apps_webhook)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Тест: {test_name}")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))
        print()
    
    print("=" * 50)
    print("📊 Результаты:")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ РАБОТАЕТ" if result else "❌ НЕ РАБОТАЕТ"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n📈 Итого: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("🎉 Все тесты пройдены! Система работает.")
        print("⚠️ Проблема может быть в реальном Mini Apps.")
    else:
        print("⚠️ Есть проблемы в системе.")

if __name__ == "__main__":
    main()
