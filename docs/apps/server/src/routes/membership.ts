import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';
import { createInviteLink } from '../lib/telegram.js';

const router = Router();

// Get invite link for channel
router.post('/invite', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookId } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is subscribed
    const now = new Date();
    const isSubscribed = user.isSubscribed && 
      user.subscriptionUntil && 
      user.subscriptionUntil > now;

    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        error: 'Subscription required'
      });
    }

    // Get channel ID
    let channelId = process.env.CHANNEL_ID;
    
    // If bookId is provided, get the specific book's channel
    if (bookId) {
      const book = await prisma.book.findUnique({
        where: { id: bookId }
      });
      
      if (book) {
        channelId = book.channelId;
      }
    }

    if (!channelId) {
      return res.status(500).json({
        success: false,
        error: 'Channel not configured'
      });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    // Create invite link
    const expireDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const inviteLink = await createInviteLink(botToken, channelId, expireDate);

    res.json({
      success: true,
      data: {
        inviteLink,
        expiresAt: expireDate,
      }
    });
  } catch (error) {
    console.error('Invite link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invite link'
    });
  }
});

export default router;
