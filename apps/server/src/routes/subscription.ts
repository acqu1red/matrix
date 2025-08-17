import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get subscription status
router.get('/status', authenticateUser, async (req: AuthenticatedRequest, res) => {
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

    const now = new Date();
    const isSubscribed = user.isSubscribed && 
      user.subscriptionUntil && 
      user.subscriptionUntil > now;

    res.json({
      success: true,
      data: {
        isSubscribed,
        until: user.subscriptionUntil,
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status'
    });
  }
});

// Check subscription (for manual payment verification)
router.post('/check', authenticateUser, async (req: AuthenticatedRequest, res) => {
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

    const now = new Date();
    const isSubscribed = user.isSubscribed && 
      user.subscriptionUntil && 
      user.subscriptionUntil > now;

    let inviteLink = null;

    if (isSubscribed) {
      // Create invite link for the channel
      const channelId = process.env.CHANNEL_ID;
      const botToken = process.env.BOT_TOKEN;
      
      if (channelId && botToken) {
        try {
          const { createInviteLink } = await import('../lib/telegram.js');
          const expireDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          inviteLink = await createInviteLink(botToken, channelId, expireDate);
        } catch (error) {
          console.error('Failed to create invite link:', error);
        }
      }
    }

    res.json({
      success: true,
      data: {
        isSubscribed,
        inviteLink,
      }
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subscription'
    });
  }
});

export default router;
