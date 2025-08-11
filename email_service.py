#!/usr/bin/env python3
"""
Email service for sending channel invitations
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from datetime import datetime, timedelta
import json

class EmailService:
    def __init__(self):
        # Email configuration (замените на ваши данные)
        self.smtp_server = "smtp.gmail.com"  # или другой SMTP сервер
        self.smtp_port = 587
        self.sender_email = "your-email@gmail.com"  # замените на ваш email
        self.sender_password = "your-app-password"  # замените на ваш пароль приложения
        
        # Channel invite link
        self.channel_invite_link = "https://t.me/+6SQb4RwwAmZlMWQ6"
        
    def send_channel_invitation(self, user_email, user_name, tariff, end_date):
        """Отправляет приглашение в канал на email пользователя"""
        try:
            # Создаем сообщение
            message = MIMEMultipart("alternative")
            message["Subject"] = "🎉 Добро пожаловать в закрытый канал ФОРМУЛА!"
            message["From"] = self.sender_email
            message["To"] = user_email
            
            # Формируем HTML письмо
            html_content = self._create_invitation_html(user_name, tariff, end_date)
            
            # Прикрепляем HTML
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Создаем безопасное соединение
            context = ssl.create_default_context()
            
            # Подключаемся к серверу
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                
                # Отправляем письмо
                server.sendmail(self.sender_email, user_email, message.as_string())
                
            print(f"✅ Приглашение отправлено на {user_email}")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка отправки email на {user_email}: {e}")
            return False
    
    def _create_invitation_html(self, user_name, tariff, end_date):
        """Создает HTML содержимое письма с приглашением"""
        
        # Форматируем дату окончания
        end_date_str = end_date.strftime("%d.%m.%Y")
        
        # Определяем длительность подписки
        tariff_names = {
            '1_month': '1 месяц',
            '6_months': '6 месяцев',
            '12_months': '12 месяцев'
        }
        tariff_name = tariff_names.get(tariff, tariff)
        
        html = f"""
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Добро пожаловать в ФОРМУЛА</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #d6c7b8;
                    margin-bottom: 10px;
                }}
                .title {{
                    font-size: 1.5em;
                    color: #333;
                    margin-bottom: 20px;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .highlight {{
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-left: 4px solid #d6c7b8;
                    margin: 20px 0;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #d6c7b8 0%, #f0eadf 100%);
                    color: #333;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 1.1em;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(214, 199, 184, 0.3);
                    transition: all 0.3s ease;
                }}
                .button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(214, 199, 184, 0.4);
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 0.9em;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ФОРМУЛА</div>
                    <div class="title">Добро пожаловать в закрытый клуб!</div>
                </div>
                
                <div class="content">
                    <p>Привет, <strong>{user_name}</strong>! 🎉</p>
                    
                    <p>Поздравляем! Ваша оплата прошла успешно, и теперь вы получили доступ к закрытому каналу <strong>ФОРМУЛА</strong>.</p>
                    
                    <div class="highlight">
                        <strong>Детали вашей подписки:</strong><br>
                        📅 Тариф: {tariff_name}<br>
                        🕐 Доступ до: {end_date_str}
                    </div>
                    
                    <p>Теперь вам нужно присоединиться к закрытому каналу. Нажмите кнопку ниже:</p>
                    
                    <div style="text-align: center;">
                        <a href="{self.channel_invite_link}" class="button">
                            🚀 Присоединиться к каналу
                        </a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Важно:</strong><br>
                        • После нажатия на кнопку вы попадете в Telegram<br>
                        • Нажмите "Присоединиться" в открывшемся окне<br>
                        • Ваша заявка будет автоматически одобрена<br>
                        • Если возникли проблемы, обратитесь в поддержку
                    </div>
                    
                    <p>В канале вас ждет:</p>
                    <ul>
                        <li>🧠 Эксклюзивные материалы по психологии и манипуляциям</li>
                        <li>💸 Стратегии заработка и инвестирования</li>
                        <li>💉 Биохакинг и оптимизация здоровья</li>
                        <li>📈 Трейдинг и скальпинг</li>
                        <li>🎥 Прямые эфиры и разборы вопросов</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>С уважением, команда ФОРМУЛА</p>
                    <p>По всем вопросам: <a href="https://t.me/cashm3thod">@cashm3thod</a></p>
                    <p>Это письмо отправлено автоматически, не отвечайте на него</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def send_subscription_expired_notification(self, user_email, user_name, end_date):
        """Отправляет уведомление об истечении подписки"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = "⚠️ Ваша подписка на ФОРМУЛА истекла"
            message["From"] = self.sender_email
            message["To"] = user_email
            
            html_content = f"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .warning {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }}
                    .button {{ display: inline-block; background: #d6c7b8; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>⚠️ Подписка истекла</h2>
                    <p>Привет, {user_name}!</p>
                    <p>Ваша подписка на закрытый канал ФОРМУЛА истекла {end_date.strftime('%d.%m.%Y')}.</p>
                    
                    <div class="warning">
                        <strong>Что это значит:</strong><br>
                        • Вы больше не можете видеть материалы канала<br>
                        • Вам нужно продлить подписку для продолжения доступа
                    </div>
                    
                    <p>Для продления подписки обратитесь к @cashm3thod</p>
                    
                    <p>С уважением, команда ФОРМУЛА</p>
                </div>
            </body>
            </html>
            """
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, user_email, message.as_string())
            
            print(f"✅ Уведомление об истечении подписки отправлено на {user_email}")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка отправки уведомления на {user_email}: {e}")
            return False

# Создаем экземпляр сервиса
email_service = EmailService()
