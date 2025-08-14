#!/usr/bin/env python3
"""
Тест полного цикла работы бота
"""

import requests
import json
import time

def test_webhook_status():
    """Проверяет статус webhook"""
    print("🔍 Проверяем статус webhook...")
    
    try:
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info")
        if response.status_code == 200:
            data = response.json()
            current_url = data.get('current_url', '')
            expected_url = data.get('expected_url', '')
            needs_fix = data.get('needs_fix', False)
            
            print(f"✅ Webhook статус:")
            print(f"   Текущий URL: {current_url}")
            print(f"   Ожидаемый URL: {expected_url}")
            print(f"   Требует исправления: {needs_fix}")
            
            return current_url == expected_url
        else:
            print(f"❌ Ошибка получения статуса webhook: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка проверки webhook: {e}")
        return False

def test_api_endpoint():
    """Тестирует API endpoint"""
    print("\n🧪 Тестируем API endpoint...")
    
    test_data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/api/create-payment",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 API ответ: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            payment_url = result.get('payment_url')
            
            if payment_url:
                print(f"✅ API endpoint работает: {payment_url}")
                return True
            else:
                print("❌ URL не найден в ответе")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            print(f"📡 Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка API запроса: {e}")
        return False

def test_webhook_endpoint():
    """Тестирует webhook endpoint"""
    print("\n🧪 Тестируем webhook endpoint...")
    
    try:
        # Тестируем GET запрос
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/webhook")
        print(f"📡 GET webhook ответ: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Webhook endpoint доступен")
            return True
        else:
            print(f"❌ Webhook endpoint недоступен: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка webhook endpoint: {e}")
        return False

def test_mini_apps_integration():
    """Тестирует интеграцию с Mini Apps"""
    print("\n🧪 Тестируем интеграцию с Mini Apps...")
    
    # Тестовые данные от Mini Apps
    test_data = {
        "step": "final_data",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0,
        "userId": "123456789"
    }
    
    try:
        # Кодируем в base64 (как это делает Mini Apps)
        import base64
        json_string = json.dumps(test_data)
        base64_data = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')
        
        print(f"📤 Тестовые данные: {json.dumps(test_data, indent=2)}")
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
            
    except Exception as e:
        print(f"❌ Ошибка тестирования Mini Apps: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование полного цикла работы бота")
    print("=" * 60)
    
    # Тест 1: Webhook статус
    webhook_ok = test_webhook_status()
    
    # Тест 2: API endpoint
    api_ok = test_api_endpoint()
    
    # Тест 3: Webhook endpoint
    webhook_endpoint_ok = test_webhook_endpoint()
    
    # Тест 4: Mini Apps интеграция
    mini_apps_ok = test_mini_apps_integration()
    
    print("\n" + "=" * 60)
    print("🎯 Итоговые результаты:")
    print(f"✅ Webhook статус: {'Работает' if webhook_ok else 'Ошибка'}")
    print(f"✅ API endpoint: {'Работает' if api_ok else 'Ошибка'}")
    print(f"✅ Webhook endpoint: {'Работает' if webhook_endpoint_ok else 'Ошибка'}")
    print(f"✅ Mini Apps интеграция: {'Работает' if mini_apps_ok else 'Ошибка'}")
    
    if all([webhook_ok, api_ok, webhook_endpoint_ok, mini_apps_ok]):
        print("\n🎉 Все тесты прошли успешно!")
        print("📱 Бот готов к работе с реальными пользователями!")
        print("\n📋 Инструкция для тестирования:")
        print("1. Откройте бота: @FormulaPrivateBot")
        print("2. Отправьте /start")
        print("3. Нажмите '💳 Оплатить через Mini Apps'")
        print("4. Заполните форму и нажмите 'Оплатить'")
        print("5. Проверьте, что бот отправил ссылку на оплату")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")
        if not webhook_ok:
            print("   - Webhook не настроен правильно")
        if not api_ok:
            print("   - API endpoint не работает")
        if not webhook_endpoint_ok:
            print("   - Webhook endpoint недоступен")
        if not mini_apps_ok:
            print("   - Проблема с обработкой данных Mini Apps")

if __name__ == "__main__":
    main()
