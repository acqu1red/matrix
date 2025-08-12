#!/usr/bin/env python3
"""
Функция для отправки приглашения на email
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email_invitation(email, tariff, subscription_id):
    """Отправляет приглашение на email"""
    try:
        print(f"📧 Начинаем отправку email на {email}")
        
        # Настройки SMTP (ваши данные)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv('SENDER_EMAIL', 'acquired.way@gmail.com')
        sender_password = os.getenv('SENDER_PASSWORD', 'itba dwcj isny gvbc')
        
        print(f"📧 SMTP сервер: {smtp_server}:{smtp_port}")
        print(f"📧 Отправитель: {sender_email}")
        
        # Создаем сообщение
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Доступ к закрытому каналу"
        
        # Текст сообщения
        body = f"""
Здравствуйте!

Ваша оплата прошла успешно!
Тариф: {tariff}

🔗 Присоединяйтесь к закрытому каналу:
https://t.me/+6SQb4RwwAmZlMWQ6

С уважением, канал Формула.
"""
        
        msg.attach(MIMEText(body, 'plain'))
        
        print(f"📧 Подключаемся к SMTP серверу...")
        # Отправляем email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        print(f"📧 Авторизуемся...")
        server.login(sender_email, sender_password)
        print(f"📧 Отправляем сообщение...")
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        
        print(f"✅ Email успешно отправлен на {email}")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка отправки email: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False
