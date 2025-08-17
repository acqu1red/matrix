import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    // Get current active season
    const now = new Date();
    const season = await prisma.season.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        Hotspot: true,
        Books: true,
      },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        error: 'No active season found'
      });
    }

    // Get user's progress for this season
    const userProgress = await prisma.progress.findMany({
      where: {
        userId: req.user!.id,
        seasonId: season.id,
      },
    });

    // Calculate total fragments collected
    const totalFragments = userProgress.reduce((sum, progress) => sum + progress.fragments, 0);

    res.json({
      success: true,
      data: {
        season: {
          id: season.id,
          title: season.title,
          startsAt: season.startsAt,
          endsAt: season.endsAt,
          mapBgUrl: season.mapBgUrl,
          mapMidUrl: season.mapMidUrl,
          mapFgUrl: season.mapFgUrl,
          fogUrl: season.fogUrl,
          skin: season.skin,
          hotspots: season.Hotspot.map(hotspot => ({
            id: hotspot.id,
            seasonId: hotspot.seasonId,
            x: hotspot.x,
            y: hotspot.y,
            type: hotspot.type,
            minigame: hotspot.minigame,
            baseReward: hotspot.baseReward,
            chanceGold: hotspot.chanceGold,
          })),
          books: season.Books.map(book => ({
            id: book.id,
            seasonId: book.seasonId,
            title: book.title,
            coverUrl: book.coverUrl,
            fragmentsCount: book.fragmentsCount,
            teaserText: book.teaserText,
            teaserImageUrl: book.teaserImageUrl,
            channelId: book.channelId,
            channelPostId: book.channelPostId,
          })),
        },
        skin: season.skin,
        publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
        channelId: process.env.CHANNEL_ID || '',
        totalFragments,
      }
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load configuration'
    });
  }
});

export default router;
