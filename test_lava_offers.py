#!/usr/bin/env python3
"""
Тестовая версия для получения офферов с текущим API ключом
"""

import requests
import json

def test_lava_offers():
    """Тестирует получение офферов с текущим API ключом"""
    
    # Текущий API ключ из bot_webhook.py
    api_key = "whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav"
    
    print("🔍 Тестируем получение офферов с текущим API ключом...")
    print(f"🔑 API Key: {api_key[:20]}...")
    
    url = "https://gate.lava.top/api/v2/products"
    
    headers = {
        "X-Api-Key": api_key,
        "Accept": "application/json"
    }
    
    params = {
        "contentCategories": "PRODUCT",
        "feedVisibility": "ALL",
        "showAllSubscriptionPeriods": "true"
    }
    
    try:
        print("📡 Отправляем запрос...")
        response = requests.get(url, headers=headers, params=params)
        
        print(f"📊 Статус ответа: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Получено {len(data)} продуктов")
            
            # Отображаем результаты
            print("\n" + "=" * 80)
            print("🎯 НАЙДЕННЫЕ ОФФЕРЫ:")
            print("=" * 80)
            
            for i, product in enumerate(data, 1):
                print(f"\n📦 Продукт #{i}: {product.get('title', 'Без названия')}")
                print(f"🆔 Product ID: {product.get('id', 'Не указан')}")
                
                offers = product.get('offers', [])
                if offers:
                    print(f"💳 Офферы ({len(offers)}):")
                    for j, offer in enumerate(offers, 1):
                        price = offer.get('price', {})
                        amount = price.get('amount', 0)
                        currency = price.get('currency', 'RUB')
                        
                        print(f"   {j}. {offer.get('name', 'Без названия')}")
                        print(f"      🆔 Offer ID: {offer.get('id', 'Не указан')}")
                        print(f"      💰 Цена: {amount} {currency}")
                else:
                    print("   ❌ Офферы не найдены")
                
                print("-" * 60)
            
            # Сохраняем в файл
            with open("test_lava_offers.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"\n💾 Результаты сохранены в файл: test_lava_offers.json")
            
            return data
            
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            print(f"📋 Ответ: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Ошибка запроса: {e}")
        return None

if __name__ == "__main__":
    test_lava_offers()
