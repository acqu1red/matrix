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

// GET /api/progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get current season
    const now = new Date()
    const currentSeason = await prisma.season.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    })

    if (!currentSeason) {
      return res.status(404).json({ error: 'No active season found' })
    }

    // Get progress for current season
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        seasonId: currentSeason.id,
      },
      include: {
        Book: true,
      },
    })

    // Calculate total fragments
    const totalFragments = progress.reduce((sum, p) => sum + p.fragments, 0)

    res.json({
      progress: progress.map(p => ({
        id: p.id,
        seasonId: p.seasonId,
        bookId: p.bookId,
        fragments: p.fragments,
      })),
      totalFragments,
      streak: user.streak,
      lastDailyAt: user.lastDailyAt,
      isSubscribed: user.isSubscribed,
    })

  } catch (error) {
    console.error('Progress error:', error)
    res.status(500).json({ error: 'Failed to load progress' })
  }
})

// POST /api/progress/collect
router.post('/collect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { hotspotId } = req.body

    if (!hotspotId) {
      return res.status(400).json({ error: 'hotspotId is required' })
    }

    // Get hotspot
    const hotspot = await prisma.hotspot.findUnique({
      where: { id: hotspotId },
      include: {
        Season: {
          include: {
            Books: true,
          },
        },
      },
    })

    if (!hotspot) {
      return res.status(404).json({ error: 'Hotspot not found' })
    }

    // Get current book (first book for now)
    const currentBook = hotspot.Season.Books[0]
    if (!currentBook) {
      return res.status(404).json({ error: 'No book found for this season' })
    }

    // Check cooldown (implement rate limiting here)
    // For now, just allow collection

    // Calculate reward
    let fragments = hotspot.baseReward
    
    // Check for gold chance
    if (hotspot.chanceGold && Math.random() < hotspot.chanceGold) {
      fragments += Math.floor(fragments * 0.5) // 50% bonus
    }

    // Update or create progress
    const existingProgress = await prisma.progress.findFirst({
      where: {
        userId,
        seasonId: hotspot.seasonId,
        bookId: currentBook.id,
      },
    })

    if (existingProgress) {
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          fragments: existingProgress.fragments + fragments,
        },
      })
    } else {
      await prisma.progress.create({
        data: {
          userId,
          seasonId: hotspot.seasonId,
          bookId: currentBook.id,
          fragments,
        },
      })
    }

    res.json({
      fragments,
      bookId: currentBook.id,
      totalFragments: (existingProgress?.fragments || 0) + fragments,
    })

  } catch (error) {
    console.error('Collect error:', error)
    res.status(500).json({ error: 'Failed to collect fragments' })
  }
})

export { router as progressRoutes }
