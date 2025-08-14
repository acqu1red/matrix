#!/usr/bin/env python3
"""
Полный тест процесса от Mini Apps до создания инвойса
"""

import requests
import json
from datetime import datetime

def test_full_process():
    """Тестирует полный процесс от Mini Apps до создания инвойса"""
    try:
        print("🧪 Тестируем полный процесс...")
        
        # Шаг 1: Тестируем соединение с ботом
        print("📡 Шаг 1: Тестируем соединение с ботом...")
        test_connection_data = {
            "step": "test_connection",
            "message": "Проверка соединения с ботом"
        }
        
        response = send_mini_apps_data(test_connection_data)
        if response.status_code != 200:
            print(f"❌ Ошибка соединения: {response.status_code}")
            return False
        print("✅ Соединение установлено")
        
        # Шаг 2: Отправляем email
        print("📡 Шаг 2: Отправляем email...")
        email_data = {
            "step": "email_data",
            "email": "test@example.com"
        }
        
        response = send_mini_apps_data(email_data)
        if response.status_code != 200:
            print(f"❌ Ошибка отправки email: {response.status_code}")
            return False
        print("✅ Email отправлен")
        
        # Шаг 3: Отправляем tariff
        print("📡 Шаг 3: Отправляем tariff...")
        tariff_data = {
            "step": "tariff_data",
            "tariff": "1_month",
            "price": 50.0
        }
        
        response = send_mini_apps_data(tariff_data)
        if response.status_code != 200:
            print(f"❌ Ошибка отправки tariff: {response.status_code}")
            return False
        print("✅ Tariff отправлен")
        
        # Шаг 4: Отправляем payment method
        print("📡 Шаг 4: Отправляем payment method...")
        payment_method_data = {
            "step": "payment_method_data",
            "paymentMethod": "card",
            "bank": "russian",
            "bankName": "Банк РФ"
        }
        
        response = send_mini_apps_data(payment_method_data)
        if response.status_code != 200:
            print(f"❌ Ошибка отправки payment method: {response.status_code}")
            return False
        print("✅ Payment method отправлен")
        
        # Шаг 5: Отправляем user ID
        print("📡 Шаг 5: Отправляем user ID...")
        user_id_data = {
            "step": "user_id_data",
            "userId": "123456789"
        }
        
        response = send_mini_apps_data(user_id_data)
        if response.status_code != 200:
            print(f"❌ Ошибка отправки user ID: {response.status_code}")
            return False
        print("✅ User ID отправлен")
        
        # Шаг 6: Отправляем финальные данные
        print("📡 Шаг 6: Отправляем финальные данные...")
        final_data = {
            "step": "final_data",
            "email": "test@example.com",
            "tariff": "1_month",
            "price": 50.0,
            "userId": "123456789"
        }
        
        response = send_mini_apps_data(final_data)
        if response.status_code != 200:
            print(f"❌ Ошибка отправки финальных данных: {response.status_code}")
            return False
        print("✅ Финальные данные отправлены")
        
        print("✅ Полный процесс прошел успешно!")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

def send_mini_apps_data(data):
    """Отправляет данные от Mini Apps в webhook"""
    mini_apps_data = json.dumps(data)
    
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
                "data": mini_apps_data,
                "button_text": "Оплатить"
            }
        }
    }
    
    response = requests.post(
        "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook",
        json=webhook_data,
        headers={"Content-Type": "application/json"}
    )
    
    return response

if __name__ == '__main__':
    success = test_full_process()
    if success:
        print("🎉 Все тесты прошли успешно!")
    else:
        print("❌ Тесты не прошли!")
