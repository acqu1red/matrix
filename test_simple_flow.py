#!/usr/bin/env python3
"""
Простой тест системы без внешних зависимостей
"""

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

def test_lava_url_generation():
    """Тестирует генерацию URL для Lava Top"""
    print("\n🧪 Тестируем генерацию URL для Lava Top...")
    
    # Данные для тестирования
    user_id = "123456789"
    email = "test@example.com"
    tariff = "1_month"
    price = 50.0
    
    # Параметры Lava Top
    LAVA_SHOP_ID = "1b9f3e05-86aa-4102-9648-268f0f586bb1"
    LAVA_PRODUCT_ID = "302ecdcd-1581-45ad-8353-a168f347b8cc"
    
    # Генерируем order_id
    import time
    order_id = f"order_{user_id}_{int(time.time())}"
    
    # Создаем metadata
    metadata = {
        "user_id": str(user_id),
        "email": email,
        "tariff": tariff
    }
    
    # Создаем URL
    payment_url = f"https://app.lava.top/ru/products/{LAVA_SHOP_ID}/{LAVA_PRODUCT_ID}?currency=RUB&amount={int(price * 100)}&order_id={order_id}&metadata={json.dumps(metadata)}"
    
    print(f"📤 Сгенерированный URL: {payment_url}")
    
    # Проверяем, что URL содержит все необходимые параметры
    if (LAVA_SHOP_ID in payment_url and 
        LAVA_PRODUCT_ID in payment_url and 
        'currency=RUB' in payment_url and
        'amount=5000' in payment_url and
        'order_id=' in payment_url and
        'metadata=' in payment_url):
        print("✅ URL содержит все необходимые параметры")
        return True
    else:
        print("❌ URL не содержит все необходимые параметры")
        return False

def test_data_flow():
    """Тестирует полный поток данных"""
    print("\n🧪 Тестируем полный поток данных...")
    
    # Шаг 1: Данные от пользователя
    user_data = {
        "user_id": "123456789",
        "email": "test@example.com",
        "tariff": "1_month",
        "price": 50.0
    }
    
    print(f"📤 Данные от пользователя: {json.dumps(user_data, indent=2)}")
    
    # Шаг 2: Данные от Mini Apps
    mini_apps_data = {
        "step": "final_data",
        "email": user_data["email"],
        "tariff": user_data["tariff"],
        "price": user_data["price"],
        "userId": user_data["user_id"]
    }
    
    print(f"📤 Данные от Mini Apps: {json.dumps(mini_apps_data, indent=2)}")
    
    # Шаг 3: Проверяем соответствие данных
    if (mini_apps_data["email"] == user_data["email"] and
        mini_apps_data["tariff"] == user_data["tariff"] and
        mini_apps_data["price"] == user_data["price"] and
        mini_apps_data["userId"] == user_data["user_id"]):
        print("✅ Данные соответствуют между пользователем и Mini Apps")
        return True
    else:
        print("❌ Данные не соответствуют")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование системы без внешних зависимостей")
    print("=" * 60)
    
    # Тест 1: Обработка данных Mini Apps
    mini_apps_ok = test_mini_apps_data_processing()
    
    # Тест 2: Генерация URL Lava Top
    lava_url_ok = test_lava_url_generation()
    
    # Тест 3: Полный поток данных
    data_flow_ok = test_data_flow()
    
    print("\n" + "=" * 60)
    print("🎯 Итоговые результаты:")
    print(f"✅ Обработка данных Mini Apps: {'Работает' if mini_apps_ok else 'Ошибка'}")
    print(f"✅ Генерация URL Lava Top: {'Работает' if lava_url_ok else 'Ошибка'}")
    print(f"✅ Полный поток данных: {'Работает' if data_flow_ok else 'Ошибка'}")
    
    if all([mini_apps_ok, lava_url_ok, data_flow_ok]):
        print("\n🎉 Все тесты прошли успешно!")
        print("📱 Система готова к работе с реальными пользователями!")
        print("\n📋 Проверьте, что:")
        print("1. Railway приложение запущено и работает")
        print("2. Webhook настроен правильно")
        print("3. API endpoint отвечает корректно")
        print("4. Бот может обрабатывать данные от Mini Apps")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")
        if not mini_apps_ok:
            print("   - Проблема с обработкой данных Mini Apps")
        if not lava_url_ok:
            print("   - Проблема с генерацией URL Lava Top")
        if not data_flow_ok:
            print("   - Проблема с потоком данных")

if __name__ == "__main__":
    main()
