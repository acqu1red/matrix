#!/usr/bin/env python3
"""
Тест для проверки базы данных и админ-прав
"""

import os
import requests
from supabase import create_client, Client

def test_supabase_connection():
    """Тест подключения к Supabase"""
    print("🔍 Тестируем подключение к Supabase...")
    
    try:
        # Создаем клиент Supabase
        supabase_url = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
        supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Тестируем подключение
        response = supabase.table('admins').select('*').limit(1).execute()
        print(f"✅ Подключение к Supabase: {response}")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка подключения к Supabase: {e}")
        return False

def test_admin_function():
    """Тест функции is_admin"""
    print("🔍 Тестируем функцию is_admin...")
    
    try:
        supabase_url = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
        supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Тестируем с админом
        response = supabase.rpc('is_admin', {'user_telegram_id': 708907063}).execute()
        print(f"✅ is_admin(708907063): {response}")
        
        # Тестируем с обычным пользователем
        response = supabase.rpc('is_admin', {'user_telegram_id': 123456789}).execute()
        print(f"✅ is_admin(123456789): {response}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка функции is_admin: {e}")
        return False

def test_admin_table():
    """Тест таблицы администраторов"""
    print("🔍 Тестируем таблицу администраторов...")
    
    try:
        supabase_url = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
        supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Получаем всех администраторов
        response = supabase.table('admins').select('*').execute()
        print(f"✅ Администраторы: {response}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка таблицы администраторов: {e}")
        return False

def test_conversations():
    """Тест таблицы диалогов"""
    print("🔍 Тестируем таблицу диалогов...")
    
    try:
        supabase_url = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
        supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Получаем диалоги администратора
        response = supabase.rpc('get_admin_conversations').execute()
        print(f"✅ Диалоги администратора: {response}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка диалогов: {e}")
        return False

def main():
    """Основная функция"""
    print("🚀 Тестирование базы данных...")
    print("=" * 50)
    
    tests = [
        ("Подключение к Supabase", test_supabase_connection),
        ("Таблица администраторов", test_admin_table),
        ("Функция is_admin", test_admin_function),
        ("Диалоги", test_conversations)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))
        print(f"{'✅ ПРОЙДЕН' if result else '❌ ПРОВАЛЕН'}: {test_name}")
    
    print("\n" + "=" * 50)
    print("📊 РЕЗУЛЬТАТЫ:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ ПРОЙДЕН" if result else "❌ ПРОВАЛЕН"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n📈 Итого: {passed}/{len(results)} тестов пройдено")
    
    if passed == len(results):
        print("🎉 База данных работает корректно!")
    else:
        print("⚠️ Есть проблемы с базой данных.")

if __name__ == "__main__":
    main()
