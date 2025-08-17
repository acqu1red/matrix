import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Claim daily reward
router.post('/daily', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if daily reward is available
    const now = new Date();
    const lastDaily = user.lastDailyAt;
    
    if (lastDaily) {
      const hoursSinceLastClaim = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24) {
        return res.status(400).json({
          success: false,
          error: 'Daily reward already claimed'
        });
      }
    }

    // Calculate reward based on streak
    const baseReward = 5;
    const streakBonus = Math.floor(user.streak / 7) * 2;
    const totalReward = baseReward + streakBonus;

    // Update user streak and last daily claim
    const newStreak = lastDaily && 
      (now.getTime() - lastDaily.getTime()) < (1000 * 60 * 60 * 48) 
      ? user.streak + 1 
      : 1;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        streak: newStreak,
        lastDailyAt: now,
      }
    });

    // Add fragments to user's progress
    const currentSeason = await prisma.season.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      }
    });

    if (currentSeason) {
      await prisma.progress.upsert({
        where: {
          userId_seasonId_bookId: {
            userId: req.user!.id,
            seasonId: currentSeason.id,
            bookId: currentSeason.id, // Using season as book for simplicity
          }
        },
        update: {
          fragments: {
            increment: totalReward
          }
        },
        create: {
          userId: req.user!.id,
          seasonId: currentSeason.id,
          bookId: currentSeason.id, // Using season as book for simplicity
          fragments: totalReward
        }
      });
    }

    res.json({
      success: true,
      data: {
        fragments: totalReward,
        streak: newStreak,
        baseReward,
        streakBonus,
      }
    });
  } catch (error) {
    console.error('Daily reward error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim daily reward'
    });
  }
});

export default router;
