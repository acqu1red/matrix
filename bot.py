from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
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
HELP_URL = "https://acqu1red.github.io/matrix/supports.html"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - просто открываем miniapps"""
    # Настраиваем кнопку меню при первом запуске
    await setup_menu_button(context.application)
    
    if update.message:
        # Отправляем видео
        try:
            with open('start.mp4', 'rb') as video:
                await update.message.reply_video(
                    video=video,
                    caption="🎬 Добро пожаловать в МАТРИЦУ!"
                )
        except FileNotFoundError:
            logger.warning("Файл start.mp4 не найден")
        
        # Создаем инлайн-кнопки
        keyboard = [
            [
                {"text": "🆘 Служба поддержки", "web_ap": "https://acqu1red.github.io/matrix/miniapps/supports.html"}
            ],
            [
                {"text": "🧠 Личный блог по психологии", "url": "https://t.me/+RbRPxCFEOe00ZThi"}
            ],
            [
                {"text": "🎯 УНИКАЛЬНОЕ ПРЕДЛОЖЕНИЕ", "callback_data": "unique_offer"}
            ],
            [
                {"text": "🎭 СКИДКА 90%: ГАЙД ПО ПСИХОЛОГИИ ЛЖИ", "callback_data": "lie_guide"}
            ],
            [
                {"text": "🔍 ПРОФАЙЛИНГ: ПОЛНЫЙ ГАЙД", "callback_data": "profiling_guide"}
            ],
            [
                {"text": "💄 РАЗБОР 100 ЖЕНСКИХ МАНИПУЛЯЦИЙ", "callback_data": "manipulation_guide"}
            ],
            [
                {"text": "💀 Симуляции", "web_app": {"url": MINIAPP_URL}}
            ]
        ]
        
        # Отправляем сообщение с жирным текстом и кнопками
        welcome_text = (
            "👆 Быстрый обзор основных симуляций и других возможностей внутри Матрицы Симуляций.\n\n"
            "*МАТРИЦА предоставляет доступ к более чем 7 уникальных тренинг-симуляций.*\n\n"
            "👇 Все возможные элементы в системе Матрицы Симуляций.\n\n"
        )
        
        await update.message.reply_text(
            welcome_text,
            parse_mode='Markdown',
            reply_markup={"inline_keyboard": keyboard}
        )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик нажатий на инлайн-кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "unique_offer":
        await query.edit_message_text("🎯 Уникальное предложение будет доступно в ближайшее время!")
    elif query.data == "lie_guide":
        await query.edit_message_text("🎭 Гайд по психологии лжи будет доступен в ближайшее время!")
    elif query.data == "profiling_guide":
        await query.edit_message_text("🔍 Полный гайд по профайлингу будет доступен в ближайшее время!")
    elif query.data == "manipulation_guide":
        await query.edit_message_text("💄 Разбор 100 женских манипуляций будет доступен в ближайшее время!")


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
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Настраиваем кнопку меню при запуске
    # setup_menu_button будет вызван после запуска polling
    
    logger.info("📝 Обработчики зарегистрированы")
    logger.info("🔄 Запуск polling...")
    
    # Запускаем бота
    application.run_polling()

if __name__ == '__main__':
    main()
