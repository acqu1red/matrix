import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { Bot } from 'grammy'
import { authRoutes } from './routes/auth'
import { configRoutes } from './routes/config'
import { progressRoutes } from './routes/progress'
import { rewardsRoutes } from './routes/rewards'
import { subscriptionRoutes } from './routes/subscription'
import { paymentsRoutes } from './routes/payments'
import { membershipRoutes } from './routes/membership'
import { postsRoutes } from './routes/posts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/config', configRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/rewards', rewardsRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/membership', membershipRoutes)
app.use('/api/posts', postsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// Initialize Telegram bot
if (process.env.BOT_TOKEN) {
  const bot = new Bot(process.env.BOT_TOKEN)
  
  // Bot handlers
  bot.command('start', async (ctx) => {
    const startParam = ctx.match || ''
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: 'Открыть остров 🌴',
            web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
          }
        ],
        [
          {
            text: 'Оплатить доступ 💫',
            url: 'https://acqu1red.github.io/formulaprivate/payment.html'
          }
        ]
      ]
    }

    await ctx.reply(
      `<b>Добро пожаловать на Остров Архив!</b>\n\n` +
      `Откройте остров и начните собирать фрагменты знаний.\n` +
      `Каждый фрагмент приближает вас к полному пониманию.`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    )
  })

  // Start bot
  bot.start()
  console.log('🤖 Telegram bot started')
}
