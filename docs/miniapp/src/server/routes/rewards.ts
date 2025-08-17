import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// POST /api/rewards/daily
router.post('/daily', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if can claim daily reward
    const now = new Date()
    if (user.lastDailyAt) {
      const lastClaim = new Date(user.lastDailyAt)
      const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
      
      if (diffHours < 24) {
        return res.status(400).json({ 
          error: 'Daily reward already claimed',
          nextClaimAt: new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
        })
      }
    }

    // Calculate reward based on streak
    const baseReward = 5
    const streakBonus = Math.floor(user.streak * 0.5) // +0.5 per day
    const totalReward = baseReward + streakBonus

    // Update streak
    const newStreak = user.lastDailyAt ? 
      (now.getTime() - new Date(user.lastDailyAt).getTime() < 48 * 60 * 60 * 1000 ? user.streak + 1 : 1) 
      : 1

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastDailyAt: now,
        streak: newStreak,
      },
    })

    // Add fragments to current season progress
    const currentSeason = await prisma.season.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        Books: true,
      },
    })

    if (currentSeason && currentSeason.Books.length > 0) {
      const currentBook = currentSeason.Books[0]
      
      const existingProgress = await prisma.progress.findFirst({
        where: {
          userId,
          seasonId: currentSeason.id,
          bookId: currentBook.id,
        },
      })

      if (existingProgress) {
        await prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            fragments: existingProgress.fragments + totalReward,
          },
        })
      } else {
        await prisma.progress.create({
          data: {
            userId,
            seasonId: currentSeason.id,
            bookId: currentBook.id,
            fragments: totalReward,
          },
        })
      }
    }

    res.json({
      fragments: totalReward,
      streak: newStreak,
      lastDailyAt: now,
      message: `Получено ${totalReward} фрагментов! Серия: ${newStreak} дней`,
    })

  } catch (error) {
    console.error('Daily reward error:', error)
    res.status(500).json({ error: 'Failed to claim daily reward' })
  }
})

export { router as rewardsRoutes }
