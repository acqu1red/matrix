import { Bot, InlineKeyboard, InlineKeyboardButton } from 'grammy';
import { prisma } from '../index.js';

// URL для нового мини-аппа
const ISLAND_URL = "https://acqu1red.github.io/formulaprivate/island.html";

export function setupBotHandlers(bot: Bot) {
  // Start command
  bot.command('start', async (ctx) => {
    const startParam = ctx.match;
    
    try {
      // Create or find user
      const tgId = ctx.from?.id.toString();
      if (!tgId) {
        await ctx.reply('Ошибка: не удалось получить ID пользователя');
        return;
      }

      let user = await prisma.user.findUnique({
        where: { tgId }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            tgId,
            username: ctx.from?.username,
            referralCode: generateReferralCode(),
          }
        });

        // Handle referral if present
        if (startParam && startParam.startsWith('ref_')) {
          const referralCode = startParam.substring(4);
          const referrer = await prisma.user.findUnique({
            where: { referralCode }
          });

          if (referrer) {
            await prisma.user.update({
              where: { id: user.id },
              data: { referrerId: referrer.id }
            });

            await prisma.referral.create({
              data: {
                referrerId: referrer.id,
                joinerUserId: user.id,
              }
            });
          }
        }
      }

      // Create keyboard with Mini Apps
      const keyboard = new InlineKeyboard()
        .webApp(
          "🏝️ Остров Архив",
          ISLAND_URL
        )
        .row()
        .webApp(
          "💳 Оплатить доступ",
          "https://acqu1red.github.io/formulaprivate/payment.html"
        )
        .row()
        .webApp(
          "📚 Подписка",
          "https://acqu1red.github.io/formulaprivate/subscription.html"
        );

      await ctx.reply(
        `🎮 Добро пожаловать в Formula Private!\n\n` +
        `🏝️ **Остров Архив** - интерактивная коллекция книг\n` +
        `💎 Собирай фрагменты, играй в мини-игры\n` +
        `📚 Получи доступ к эксклюзивным материалам\n\n` +
        `Выберите действие:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );
    } catch (error) {
      console.error('Start command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  });

  // Help command
  bot.command('help', async (ctx) => {
    const helpText = 
      `🎮 **Formula Private - Остров Архив**\n\n` +
      `**Команды:**\n` +
      `/start - Запустить приложение\n` +
      `/help - Показать эту справку\n` +
      `/island - Открыть Остров Архив\n\n` +
      `**Как играть:**\n` +
      `🏝️ Исследуй остров и находи хотспоты\n` +
      `💎 Собирай фрагменты (tap/hold)\n` +
      `🎮 Играй в мини-игры для бонусов\n` +
      `📚 Открывай книги и читай контент\n` +
      `🎁 Получай ежедневные награды\n\n` +
      `**Реферальная система:**\n` +
      `Поделись своим кодом с друзьями и получай бонусы!`;

    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });

  // Island command
  bot.command('island', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp("🏝️ Открыть Остров Архив", ISLAND_URL);

    await ctx.reply(
      `🏝️ **Остров Архив**\n\n` +
      `Откройте интерактивную карту и начните собирать фрагменты!`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );
  });

  // Handle callback queries
  bot.on('callback_query', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const data = ctx.callbackQuery.data;
      
      switch (data) {
        case 'open_island':
          await ctx.editMessageText(
            `🏝️ **Остров Архив**\n\n` +
            `Откройте приложение и начните исследование!`,
            {
              parse_mode: 'Markdown',
              reply_markup: new InlineKeyboard()
                .webApp("🏝️ Открыть", ISLAND_URL)
            }
          );
          break;
          
        case 'share_referral':
          const user = await prisma.user.findUnique({
            where: { tgId: ctx.from?.id.toString() }
          });
          
          if (user) {
            const shareText = 
              `🎮 Присоединяйся к Formula Private - Остров Архив!\n\n` +
              `Собирай фрагменты, играй в мини-игры и получи доступ к эксклюзивным книгам.\n\n` +
              `Мой код: ${user.referralCode}\n\n` +
              `https://t.me/${ctx.me.username}?start=ref_${user.referralCode}`;
            
            await ctx.editMessageText(shareText, {
              reply_markup: new InlineKeyboard()
                .webApp("🏝️ Открыть приложение", ISLAND_URL)
            });
          }
          break;
          
        default:
          await ctx.editMessageText('Неизвестная команда');
      }
    } catch (error) {
      console.error('Callback query error:', error);
      await ctx.answerCallbackQuery('Произошла ошибка');
    }
  });

  // Handle web app data
  bot.on('message:web_app_data', async (ctx) => {
    try {
      const webAppData = ctx.message.web_app_data;
      console.log('Web app data received:', webAppData.data);
      
      // You can process web app data here if needed
      await ctx.reply('Данные получены! Спасибо за использование приложения.');
    } catch (error) {
      console.error('Web app data error:', error);
      await ctx.reply('Ошибка обработки данных');
    }
  });
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
