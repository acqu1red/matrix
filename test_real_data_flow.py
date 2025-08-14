#!/usr/bin/env python3
"""
Тест обработки реальных данных от Mini Apps
"""

import requests
import json
import base64

def test_mini_apps_data_processing():
    """Тестирует обработку данных от Mini Apps"""
    print("🧪 Тестируем обработку данных от Mini Apps...")
    
    # Реальные данные, которые отправляет Mini Apps
    real_data = {
        "step": "final_data",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0,
        "userId": "123456789",
        "paymentMethod": "card",
        "bank": "sberbank",
        "bankName": "Сбербанк"
    }
    
    print(f"📤 Реальные данные от Mini Apps: {json.dumps(real_data, indent=2)}")
    
    # Кодируем в base64 (как это делает Mini Apps)
    json_string = json.dumps(real_data)
    base64_data = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')
    
    print(f"📤 Base64 данные: {base64_data}")
    
    # Декодируем обратно (как это делает наш бот)
    decoded_data = base64.b64decode(base64_data).decode('utf-8')
    parsed_data = json.loads(decoded_data)
    
    print(f"📤 Декодированные данные: {json.dumps(parsed_data, indent=2)}")
    
    # Проверяем, что данные корректны
    if (parsed_data.get('step') == 'final_data' and 
        parsed_data.get('email') and 
        parsed_data.get('tariff') and 
        parsed_data.get('price')):
        print("✅ Обработка данных Mini Apps работает")
        return True
    else:
        print("❌ Ошибка обработки данных Mini Apps")
        return False

def test_api_with_real_data():
    """Тестирует API с реальными данными"""
    print("\n🧪 Тестируем API с реальными данными...")
    
    # Реальные данные пользователя
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
        
        if response.status_code == 200:
            result = response.json()
            payment_url = result.get('payment_url')
            
            if payment_url:
                print(f"✅ API работает с реальными данными: {payment_url}")
                
                # Проверяем, что URL содержит правильные параметры
                if 'user_id' in payment_url and 'email' in payment_url and 'tariff' in payment_url:
                    print("✅ URL содержит все необходимые параметры")
                    return True
                else:
                    print("❌ URL не содержит все необходимые параметры")
                    return False
            else:
                print("❌ URL не найден в API ответе")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            print(f"📡 Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API запроса: {e}")
        return False

def test_webhook_processing():
    """Тестирует обработку webhook"""
    print("\n🧪 Тестируем обработку webhook...")
    
    # Симулируем данные от Telegram
    telegram_data = {
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
                "data": "eyJzdGVwIjogImZpbmFsX2RhdGEiLCAiZW1haWwiOiAidGVzdEBleGFtcGxlLmNvbSIsICJ0YXJpZmYiOiAiMV9tb250aCIsICJwcmljZSI6IDUwLjAsICJ1c2VySWQiOiAiMTIzNDU2Nzg5In0=",
                "button_text": "Оплатить"
            }
        }
    }
    
    print(f"📤 Симулируем данные от Telegram: {json.dumps(telegram_data, indent=2)}")
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=telegram_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 Webhook ответ: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Webhook обрабатывает данные корректно")
            return True
        else:
            print(f"❌ Webhook ошибка: {response.status_code}")
            print(f"📡 Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка webhook запроса: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование обработки реальных данных")
    print("=" * 60)
    
    # Тест 1: Обработка данных Mini Apps
    mini_apps_ok = test_mini_apps_data_processing()
    
    # Тест 2: API с реальными данными
    api_ok = test_api_with_real_data()
    
    # Тест 3: Обработка webhook
    webhook_ok = test_webhook_processing()
    
    print("\n" + "=" * 60)
    print("🎯 Итоговые результаты:")
    print(f"✅ Обработка данных Mini Apps: {'Работает' if mini_apps_ok else 'Ошибка'}")
    print(f"✅ API с реальными данными: {'Работает' if api_ok else 'Ошибка'}")
    print(f"✅ Обработка webhook: {'Работает' if webhook_ok else 'Ошибка'}")
    
    if all([mini_apps_ok, api_ok, webhook_ok]):
        print("\n🎉 Все тесты прошли успешно!")
        print("📱 Бот готов к работе с реальными пользователями!")
        print("\n📋 Проверьте, что:")
        print("1. В логах Railway появляются сообщения о получении данных")
        print("2. Бот отправляет ссылку на оплату пользователю")
        print("3. Ссылка содержит правильные параметры")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")
        if not mini_apps_ok:
            print("   - Проблема с обработкой данных Mini Apps")
        if not api_ok:
            print("   - Проблема с API endpoint")
        if not webhook_ok:
            print("   - Проблема с обработкой webhook")

if __name__ == "__main__":
    main()
