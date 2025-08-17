import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/config
router.get('/', async (req, res) => {
  try {
    // Get current season
    const now = new Date()
    const currentSeason = await prisma.season.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        Books: true,
        Hotspot: true,
      },
    })

    if (!currentSeason) {
      return res.status(404).json({ error: 'No active season found' })
    }

    // Get current book (first book for now)
    const currentBook = currentSeason.Books[0] || null

    // Transform data for frontend
    const seasonData = {
      id: currentSeason.id,
      title: currentSeason.title,
      startsAt: currentSeason.startsAt,
      endsAt: currentSeason.endsAt,
      mapAssets: {
        bg: currentSeason.mapBgUrl,
        mid: currentSeason.mapMidUrl,
        fg: currentSeason.mapFgUrl,
        fog: currentSeason.fogUrl,
      },
      skin: currentSeason.skin,
      hotspots: currentSeason.Hotspot.map(hotspot => ({
        id: hotspot.id,
        x: hotspot.x,
        y: hotspot.y,
        type: hotspot.type,
        minigame: hotspot.minigame,
        baseReward: hotspot.baseReward,
        chanceGold: hotspot.chanceGold,
      })),
    }

    const booksData = currentSeason.Books.map(book => ({
      id: book.id,
      title: book.title,
      coverUrl: book.coverUrl,
      fragmentsCount: book.fragmentsCount,
      teaser: {
        text: book.teaserText,
        imageUrl: book.teaserImageUrl,
      },
      channelId: book.channelId,
      channelPostId: book.channelPostId,
    }))

    res.json({
      season: seasonData,
      currentBook: currentBook ? {
        id: currentBook.id,
        title: currentBook.title,
        coverUrl: currentBook.coverUrl,
        fragmentsCount: currentBook.fragmentsCount,
        teaser: {
          text: currentBook.teaserText,
          imageUrl: currentBook.teaserImageUrl,
        },
        channelId: currentBook.channelId,
        channelPostId: currentBook.channelPostId,
      } : null,
      books: booksData,
    })

  } catch (error) {
    console.error('Config error:', error)
    res.status(500).json({ error: 'Failed to load config' })
  }
})

export { router as configRoutes }
