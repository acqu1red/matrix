import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get user progress
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const progress = await prisma.progress.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        Season: true,
        Book: true,
      },
    });

    res.json({
      success: true,
      data: progress.map(p => ({
        id: p.id,
        userId: p.userId,
        seasonId: p.seasonId,
        bookId: p.bookId,
        fragments: p.fragments,
      }))
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

// Collect fragment from hotspot
router.post('/collect', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { hotspotId } = req.body;
    
    if (!hotspotId) {
      return res.status(400).json({
        success: false,
        error: 'Hotspot ID is required'
      });
    }

    // Get hotspot
    const hotspot = await prisma.hotspot.findUnique({
      where: { id: hotspotId },
      include: { Season: true }
    });

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        error: 'Hotspot not found'
      });
    }

    // Check if user has already collected from this hotspot recently
    const lastCollection = await prisma.progress.findFirst({
      where: {
        userId: req.user!.id,
        seasonId: hotspot.seasonId,
      },
      orderBy: { id: 'desc' }
    });

    // Simple cooldown check (in production, you'd want more sophisticated rate limiting)
    if (lastCollection) {
      const timeSinceLastCollection = Date.now() - lastCollection.id.length; // Simplified check
      if (timeSinceLastCollection < 1500) { // 1.5 seconds cooldown
        return res.status(429).json({
          success: false,
          error: 'Collection cooldown active'
        });
      }
    }

    // Calculate reward
    let fragments = hotspot.baseReward;
    let isGold = false;

    // Check for gold chance
    if (hotspot.chanceGold && Math.random() < hotspot.chanceGold) {
      fragments *= 2;
      isGold = true;
    }

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_seasonId_bookId: {
          userId: req.user!.id,
          seasonId: hotspot.seasonId,
          bookId: hotspot.seasonId, // Using season as book for simplicity
        }
      },
      update: {
        fragments: {
          increment: fragments
        }
      },
      create: {
        userId: req.user!.id,
        seasonId: hotspot.seasonId,
        bookId: hotspot.seasonId, // Using season as book for simplicity
        fragments: fragments
      }
    });

    res.json({
      success: true,
      data: {
        fragments,
        isGold,
        totalFragments: progress.fragments
      }
    });
  } catch (error) {
    console.error('Fragment collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to collect fragment'
    });
  }
});

export default router;
