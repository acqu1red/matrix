#!/usr/bin/env python3
"""
Скрипт для получения офферов из Lava Top API
"""

import requests
import json
import os

def get_lava_offers(api_key):
    """Получает список офферов из Lava Top API"""
    
    print("🔍 Получаем офферы из Lava Top API...")
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
            return data
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            print(f"📋 Ответ: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Ошибка запроса: {e}")
        return None

def display_offers(products):
    """Отображает офферы в удобном формате"""
    
    if not products:
        print("❌ Нет данных для отображения")
        return
    
    print("\n" + "=" * 80)
    print("🎯 НАЙДЕННЫЕ ОФФЕРЫ:")
    print("=" * 80)
    
    for i, product in enumerate(products, 1):
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

def save_offers_to_file(products, filename="lava_offers.json"):
    """Сохраняет офферы в JSON файл"""
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Офферы сохранены в файл: {filename}")
    except Exception as e:
        print(f"❌ Ошибка сохранения файла: {e}")

def main():
    """Основная функция"""
    
    print("🚀 Получение офферов из Lava Top API")
    print("=" * 50)
    
    # Получаем API ключ
    api_key = input("🔑 Введите ваш API ключ из кабинета app.lava.top: ").strip()
    
    if not api_key:
        print("❌ API ключ не введен!")
        return
    
    # Получаем офферы
    products = get_lava_offers(api_key)
    
    if products:
        # Отображаем офферы
        display_offers(products)
        
        # Сохраняем в файл
        save_offers_to_file(products)
        
        print("\n✅ Готово! Теперь у вас есть список всех офферов.")
        print("📋 Используйте Offer ID для создания платежных ссылок.")
        
    else:
        print("❌ Не удалось получить офферы")

if __name__ == "__main__":
    main()
