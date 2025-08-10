#!/usr/bin/env python3
"""
Тестовый скрипт для проверки подключения к базе данных Supabase
"""

from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"

def test_connection():
    """Тестирует подключение к базе данных"""
    try:
        print("🔌 Подключение к Supabase...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Подключение успешно!")
        
        # Проверяем таблицы
        print("\n📋 Проверка таблиц...")
        
        # Проверяем таблицу users
        try:
            result = supabase.table('users').select('*').limit(1).execute()
            print("✅ Таблица 'users' доступна")
        except Exception as e:
            print(f"❌ Ошибка таблицы 'users': {e}")
        
        # Проверяем таблицу conversations
        try:
            result = supabase.table('conversations').select('*').limit(1).execute()
            print("✅ Таблица 'conversations' доступна")
        except Exception as e:
            print(f"❌ Ошибка таблицы 'conversations': {e}")
        
        # Проверяем таблицу messages
        try:
            result = supabase.table('messages').select('*').limit(1).execute()
            print("✅ Таблица 'messages' доступна")
        except Exception as e:
            print(f"❌ Ошибка таблицы 'messages': {e}")
        
        # Проверяем таблицу admins
        try:
            result = supabase.table('admins').select('*').limit(1).execute()
            print("✅ Таблица 'admins' доступна")
        except Exception as e:
            print(f"❌ Ошибка таблицы 'admins': {e}")
        
        # Проверяем администраторов
        print("\n👥 Проверка администраторов...")
        try:
            result = supabase.table('users').select('*').eq('telegram_id', 708907063).execute()
            if result.data:
                print(f"✅ Администратор 708907063 найден: {result.data[0]}")
            else:
                print("❌ Администратор 708907063 не найден")
        except Exception as e:
            print(f"❌ Ошибка поиска администратора: {e}")
        
        # Проверяем функцию get_admin_conversations
        print("\n🔧 Проверка функции get_admin_conversations...")
        try:
            result = supabase.rpc('get_admin_conversations').execute()
            print("✅ Функция get_admin_conversations работает")
            print(f"📊 Результат: {len(result.data)} записей")
            if result.data:
                print(f"📝 Первая запись: {result.data[0]}")
        except Exception as e:
            print(f"❌ Ошибка функции get_admin_conversations: {e}")
        
        # Тестируем вставку данных
        print("\n📝 Тестирование вставки данных...")
        try:
            # Тестовый пользователь
            test_user = {
                'telegram_id': 999999999,
                'username': 'test_user',
                'first_name': 'Test',
                'last_name': 'User'
            }
            
            # Вставляем пользователя
            result = supabase.table('users').upsert(test_user).execute()
            print("✅ Вставка пользователя успешна")
            
            # Создаем диалог
            conversation_data = {
                'user_id': 999999999,
                'status': 'open'
            }
            result = supabase.table('conversations').insert(conversation_data).execute()
            print("✅ Создание диалога успешно")
            
            # Вставляем сообщение
            message_data = {
                'conversation_id': result.data[0]['id'],
                'sender_id': 999999999,
                'content': 'Тестовое сообщение',
                'message_type': 'text'
            }
            result = supabase.table('messages').insert(message_data).execute()
            print("✅ Вставка сообщения успешна")
            
            # Очищаем тестовые данные
            supabase.table('messages').delete().eq('sender_id', 999999999).execute()
            supabase.table('conversations').delete().eq('user_id', 999999999).execute()
            supabase.table('users').delete().eq('telegram_id', 999999999).execute()
            print("🧹 Тестовые данные очищены")
            
        except Exception as e:
            print(f"❌ Ошибка тестирования вставки: {e}")
        
    except Exception as e:
        print(f"❌ Ошибка подключения к Supabase: {e}")

if __name__ == "__main__":
    test_connection()
