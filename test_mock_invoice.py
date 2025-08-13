#!/usr/bin/env python3
"""
Тест с заглушкой для имитации создания инвойса
"""

import requests
import json
from datetime import datetime

def test_mock_invoice():
    """Тестирует создание инвойса с заглушкой"""
    try:
        print("🧪 Тестируем создание инвойса с заглушкой...")
        
        # Имитируем данные от Mini Apps
        final_data = {
            "step": "final_data",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0,
            "userId": "123456789"
        }
        
        print(f"📤 Отправляем финальные данные: {json.dumps(final_data, indent=2)}")
        
        # Отправляем данные в webhook
        webhook_data = {
            "update_id": int(datetime.now().timestamp()),
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
                "date": int(datetime.now().timestamp()),
                "web_app_data": {
                    "data": json.dumps(final_data),
                    "button_text": "Оплатить"
                }
            }
        }
        
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Статус ответа: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Данные отправлены успешно!")
            print("📋 Теперь нужно проверить логи Railway для диагностики")
            return True
        else:
            print(f"❌ Ошибка отправки данных: {response.status_code}")
            return False
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    success = test_mock_invoice()
    if success:
        print("🎉 Тест с заглушкой прошел успешно!")
        print("📋 Проверьте логи Railway для диагностики проблемы с Lava Top API")
    else:
        print("❌ Тест с заглушкой не прошел!")
