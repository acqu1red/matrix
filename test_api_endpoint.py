#!/usr/bin/env python3
"""
Тест для нового API endpoint
"""

import requests
import json

def test_api_endpoint():
    """Тестирует новый API endpoint"""
    try:
        print("🧪 Тестируем новый API endpoint...")
        
        # Тестовые данные
        test_data = {
            "user_id": "123456789",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0
        }
        
        print(f"📤 Отправляем данные: {json.dumps(test_data, indent=2)}")
        
        # Отправляем запрос к API endpoint
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Статус ответа: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
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
        print(f"❌ Ошибка тестирования API: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    success = test_api_endpoint()
    if success:
        print("🎉 API endpoint тест прошел успешно!")
    else:
        print("❌ API endpoint тест не прошел!")
