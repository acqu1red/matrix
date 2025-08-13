#!/usr/bin/env python3
"""
Тест обработки данных от Mini Apps
"""

import json
import base64

def test_mini_apps_data_processing():
    """Тестирует обработку данных от Mini Apps"""
    print("🧪 Тестируем обработку данных от Mini Apps...")
    
    # Тестовые данные (как они приходят от Mini Apps)
    test_data = {
        "step": "final_data",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0,
        "userId": "123456789"
    }
    
    print(f"📤 Исходные данные: {json.dumps(test_data, indent=2)}")
    
    # Кодируем в base64 (как это делает Mini Apps)
    json_string = json.dumps(test_data)
    base64_data = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')
    
    print(f"📤 Base64 данные: {base64_data}")
    
    # Декодируем обратно (как это делает наш бот)
    try:
        decoded_data = base64.b64decode(base64_data).decode('utf-8')
        print(f"📤 Декодированные данные: {decoded_data}")
        
        parsed_data = json.loads(decoded_data)
        print(f"📤 Парсированные данные: {json.dumps(parsed_data, indent=2)}")
        
        # Проверяем, что данные корректны
        if parsed_data.get('step') == 'final_data':
            print("✅ Шаг данных корректный")
        else:
            print("❌ Неверный шаг данных")
            
        if parsed_data.get('email'):
            print("✅ Email получен")
        else:
            print("❌ Email отсутствует")
            
        if parsed_data.get('tariff'):
            print("✅ Tariff получен")
        else:
            print("❌ Tariff отсутствует")
            
        if parsed_data.get('price'):
            print("✅ Price получен")
        else:
            print("❌ Price отсутствует")
            
        if parsed_data.get('userId'):
            print("✅ UserId получен")
        else:
            print("❌ UserId отсутствует")
            
        return True
        
    except Exception as e:
        print(f"❌ Ошибка обработки данных: {e}")
        return False

def test_api_endpoint_with_mini_apps_data():
    """Тестирует API endpoint с данными от Mini Apps"""
    print("\n🧪 Тестируем API endpoint с данными от Mini Apps...")
    
    import requests
    
    # Данные в формате, который отправляет наш бот
    api_data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    print(f"📤 Отправляем данные в API: {json.dumps(api_data, indent=2)}")
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=api_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 API ответ: {response.status_code}")
        print(f"📡 Ответ текст: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            payment_url = result.get('payment_url')
            
            if payment_url:
                print(f"✅ URL для оплаты создан: {payment_url}")
                return True
            else:
                print("❌ URL не найден в ответе")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API запроса: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Тестирование обработки данных от Mini Apps")
    print("=" * 60)
    
    # Тест 1: Обработка данных
    success1 = test_mini_apps_data_processing()
    
    # Тест 2: API endpoint
    success2 = test_api_endpoint_with_mini_apps_data()
    
    print("\n" + "=" * 60)
    print("🎯 Итоговые результаты:")
    print(f"✅ Обработка данных: {'Успешно' if success1 else 'Ошибка'}")
    print(f"✅ API endpoint: {'Успешно' if success2 else 'Ошибка'}")
    
    if success1 and success2:
        print("🎉 Все тесты прошли успешно!")
        print("📱 Mini Apps готовы к работе!")
    else:
        print("❌ Есть проблемы, которые нужно исправить")
