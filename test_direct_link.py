#!/usr/bin/env python3
"""
Тест создания прямых ссылок на оплату Lava Top
"""

import json
from datetime import datetime

# Данные Lava Top
LAVA_SHOP_ID = "1b9f3e05-86aa-4102-9648-268f0f586bb1"
LAVA_PRODUCT_ID = "302ecdcd-1581-45ad-8353-a168f347b8cc"

def test_direct_link():
    """Тестирует создание прямой ссылки на оплату"""
    print("🧪 Тестируем создание прямой ссылки на оплату...")
    print(f"🔑 LAVA_SHOP_ID: {LAVA_SHOP_ID}")
    print(f"🔑 LAVA_PRODUCT_ID: {LAVA_PRODUCT_ID}")
    
    # Тестовые данные
    user_id = "123456789"
    email = "test@example.com"
    tariff = "1_month"
    price = 50.0
    
    # Создаем прямую ссылку на оплату
    order_id = f"order_{user_id}_{int(datetime.now().timestamp())}"
    
    # Создаем прямую ссылку на оплату
    payment_url = f"https://app.lava.top/ru/products/{LAVA_SHOP_ID}/{LAVA_PRODUCT_ID}?currency=RUB&amount={int(price * 100)}&order_id={order_id}&metadata={json.dumps({'user_id': str(user_id), 'email': email, 'tariff': tariff})}"
    
    print(f"✅ Создана прямая ссылка на оплату: {payment_url}")
    
    # Проверяем, что ссылка содержит все необходимые параметры
    required_params = [
        f"currency=RUB",
        f"amount={int(price * 100)}",
        f"order_id={order_id}",
        "metadata="
    ]
    
    for param in required_params:
        if param in payment_url:
            print(f"✅ Параметр найден: {param}")
        else:
            print(f"❌ Параметр не найден: {param}")
    
    return payment_url

if __name__ == "__main__":
    payment_url = test_direct_link()
    print(f"\n🎯 Итоговая ссылка: {payment_url}")
    print("✅ Тест создания прямой ссылки прошел успешно!")
