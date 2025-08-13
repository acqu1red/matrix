#!/usr/bin/env python3
"""
Простой тест для проверки доступности Lava Top API
"""

import requests
import json

def test_lava_api_simple():
    """Простой тест API"""
    try:
        print("🧪 Простой тест Lava Top API...")
        
        # Тестируем разные endpoints
        endpoints = [
            "https://api.lava.top/",
            "https://api.lava.top/health",
            "https://api.lava.top/status",
            "https://api.lava.top/v1/",
            "https://api.lava.top/business/",
        ]
        
        for endpoint in endpoints:
            print(f"📡 Тестируем: {endpoint}")
            try:
                response = requests.get(endpoint, timeout=10)
                print(f"   Статус: {response.status_code}")
                print(f"   Заголовки: {dict(response.headers)}")
                if response.status_code == 200:
                    print(f"   Ответ: {response.text[:200]}...")
                print()
            except Exception as e:
                print(f"   Ошибка: {e}")
                print()
        
        # Тестируем POST запрос
        print("📡 Тестируем POST запрос...")
        test_data = {
            "test": "data"
        }
        
        try:
            response = requests.post("https://api.lava.top/", json=test_data, timeout=10)
            print(f"   POST статус: {response.status_code}")
            print(f"   POST ответ: {response.text[:200]}...")
        except Exception as e:
            print(f"   POST ошибка: {e}")
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")

if __name__ == '__main__':
    test_lava_api_simple()
