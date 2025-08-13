#!/usr/bin/env python3
"""
Тест исправленного API endpoint
"""

import requests
import json

def test_api_endpoint():
    """Тестирует исправленный API endpoint"""
    print("🧪 Тестируем исправленный API endpoint...")
    
    # Тестовые данные
    test_data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    print(f"📤 Отправляем данные: {json.dumps(test_data, indent=2)}")
    
    # Отправляем запрос к API endpoint
    api_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment"
    
    try:
        response = requests.post(
            api_url,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 Ответ API: {response.status_code}")
        print(f"📡 Ответ текст: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Успешно! Полный ответ: {json.dumps(result, indent=2)}")
            
            payment_url = result.get('payment_url')
            if payment_url:
                print(f"✅ URL для оплаты: {payment_url}")
                return True
            else:
                print(f"❌ URL не найден в ответе")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка запроса: {e}")
        return False

if __name__ == "__main__":
    success = test_api_endpoint()
    if success:
        print("✅ Тест API endpoint прошел успешно!")
    else:
        print("❌ Тест API endpoint не прошел!")
