#!/usr/bin/env python3
"""
Тест для имитации данных от Mini Apps
"""

import requests
import json

def test_mini_apps_data():
    """Тестирует отправку данных от Mini Apps"""
    try:
        print("🧪 Тестируем отправку данных от Mini Apps...")
        
        # Имитируем данные от Mini Apps
        mini_apps_data = {
            "step": "final_data",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0,
            "userId": "123456789"
        }
        
        print(f"📤 Отправляем данные: {json.dumps(mini_apps_data, indent=2)}")
        
        # Отправляем данные в webhook
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
            json={
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
            },
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Статус ответа: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Ошибка тестирования Mini Apps: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    success = test_mini_apps_data()
    if success:
        print("✅ Mini Apps тест прошел успешно!")
    else:
        print("❌ Mini Apps тест не прошел!")
