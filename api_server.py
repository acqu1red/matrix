from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
from backend import backend, handle_new_message, handle_admin_response, get_admin_panel_data

app = Flask(__name__)
CORS(app)

# Функция для запуска асинхронных функций
def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@app.route('/api/send_message', methods=['POST'])
def send_message():
    """API для отправки сообщения от пользователя"""
    try:
        data = request.json
        
        user_data = {
            'telegram_id': data.get('user_id'),
            'username': data.get('username'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name')
        }
        
        message_content = data.get('message', '')
        message_type = data.get('message_type', 'text')
        file_data = data.get('file_data')
        
        result = run_async(handle_new_message(
            user_data=user_data,
            message_content=message_content,
            message_type=message_type,
            file_data=file_data
        ))
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin_response', methods=['POST'])
def admin_response():
    """API для ответа администратора"""
    try:
        data = request.json
        
        admin_telegram_id = data.get('admin_id')
        conversation_id = data.get('conversation_id')
        message_content = data.get('message', '')
        message_type = data.get('message_type', 'text')
        
        result = run_async(handle_admin_response(
            admin_telegram_id=admin_telegram_id,
            conversation_id=conversation_id,
            message_content=message_content,
            message_type=message_type
        ))
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin_panel/<int:admin_id>', methods=['GET'])
def admin_panel_data(admin_id):
    """API для получения данных админ-панели"""
    try:
        result = run_async(get_admin_panel_data(admin_id))
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def get_conversation_messages(conversation_id):
    """API для получения сообщений диалога"""
    try:
        messages = run_async(backend.get_conversation_messages(conversation_id))
        return jsonify({'messages': messages})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check_admin/<int:telegram_id>', methods=['GET'])
def check_admin(telegram_id):
    """API для проверки прав администратора"""
    try:
        is_admin = run_async(backend.is_user_admin(telegram_id))
        return jsonify({'is_admin': is_admin})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mark_read/<conversation_id>/<int:reader_id>', methods=['POST'])
def mark_messages_read(conversation_id, reader_id):
    """API для отметки сообщений как прочитанных"""
    try:
        result = run_async(backend.mark_messages_as_read(conversation_id, reader_id))
        return jsonify({'success': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
