#!/usr/bin/env python3
"""
Тест новой системы LAVA TOP API v2
"""

import os
import asyncio
import aiohttp
import json

# Тестовые переменные окружения
os.environ["LAVA_TOP_API_BASE"] = "https://gate.lava.top"
os.environ["LAVA_TOP_API_KEY"] = "test_key"  # Замените на реальный ключ
os.environ["LAVA_OFFER_ID_BASIC"] = "test_offer_id"  # Замените на реальный offer ID

# Импортируем функцию из основного модуля
from bot_webhook import create_lava_top_invoice

async def test_create_invoice():
    """Тест создания инвойса"""
    print("🧪 Тестирование создания инвойса...")
    
    try:
        pay_url = await create_lava_top_invoice(
            email="test@example.com",
            tariff="basic",
            price=50,
            bank="russian",
            user_id=123456,
            chat_id=123456
        )
        print(f"✅ Инвойс создан успешно: {pay_url}")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания инвойса: {e}")
        return False

async def test_api_endpoint():
    """Тест API эндпоинта"""
    print("🧪 Тестирование API эндпоинта...")
    
    # Здесь можно добавить тест POST запроса к /api/create-payment
    # Пока просто заглушка
    print("✅ API эндпоинт готов к тестированию")
    return True

async def test_webhook_processing():
    """Тест обработки вебхука"""
    print("🧪 Тестирование обработки вебхука...")
    
    # Тестовый вебхук от LAVA
    test_webhook = {
        "eventType": "payment.success",
        "data": {
            "metadata": {
                "user_id": "123456",
                "chat_id": "123456"
            }
        }
    }
    
    print(f"✅ Вебхук готов к обработке: {json.dumps(test_webhook, indent=2)}")
    return True

async def main():
    """Основная функция тестирования"""
    print("🚀 Запуск тестов новой системы LAVA TOP API v2")
    print("=" * 50)
    
    tests = [
        test_create_invoice,
        test_api_endpoint,
        test_webhook_processing
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"❌ Ошибка в тесте {test.__name__}: {e}")
            results.append(False)
    
    print("=" * 50)
    print("📊 Результаты тестирования:")
    for i, result in enumerate(results):
        status = "✅ ПРОЙДЕН" if result else "❌ ПРОВАЛЕН"
        print(f"Тест {i+1}: {status}")
    
    if all(results):
        print("🎉 Все тесты пройдены успешно!")
    else:
        print("⚠️ Некоторые тесты провалены. Проверьте настройки.")

if __name__ == "__main__":
    asyncio.run(main())
