from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from telegram.ext import ApplicationBuilder
import asyncio
import logging

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ"
MINIAPP_URL = "https://acqu1red.github.io/matrix"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - просто открываем miniapps"""
    # Настраиваем кнопку меню при первом запуске
    await setup_menu_button(context.application)
    
    if update.message:
        await update.message.reply_text(
            "🚀 Добро пожаловать! Используйте кнопку меню для открытия приложения.",
            reply_markup={
                "inline_keyboard": [[
                    {
                        "text": "💀 Симуляции",
                        "web_app": {"url": MINIAPP_URL}
                    }
                ]]
            }
        )


async def setup_menu_button(application: Application) -> None:
    """Настройка кнопки меню для открытия Mini App"""
    try:
        await application.bot.set_chat_menu_button(
            menu_button={
                "type": "web_app",
                "text": "💀 Симуляции",
                "web_app": {"url": MINIAPP_URL}
            }
        )
        logger.info("✅ Кнопка меню успешно настроена")
    except Exception as e:
        logger.error(f"❌ Ошибка настройки кнопки меню: {e}")

def main() -> None:
    """Основная функция запуска бота"""
    logger.info("🚀 Запуск Matrix бота...")
    
    # Создаем приложение
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start))
    
    # Настраиваем кнопку меню при запуске
    # setup_menu_button будет вызван после запуска polling
    
    logger.info("📝 Обработчики зарегистрированы")
    logger.info("🔄 Запуск polling...")
    
    # Запускаем бота
    application.run_polling()

if __name__ == '__main__':
    main()
