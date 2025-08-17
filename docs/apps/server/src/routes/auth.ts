import { Router } from 'express';
import { prisma } from '../index.js';
import { validateInitData, parseInitData } from '../lib/telegram.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/validate', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({
        success: false,
        error: 'Init data is required'
      });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    // Validate init data
    if (!validateInitData(initData, botToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid init data signature'
      });
    }

    // Parse init data
    const parsedData = parseInitData(initData);
    if (!parsedData || !parsedData.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid init data format'
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { tgId: parsedData.user.id.toString() }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          tgId: parsedData.user.id.toString(),
          username: parsedData.user.username,
          referralCode: generateReferralCode(),
        }
      });

      // Handle referral if present
      if (parsedData.start_param?.startsWith('ref_')) {
        const referralCode = parsedData.start_param.substring(4);
        const referrer = await prisma.user.findUnique({
          where: { referralCode }
        });

        if (referrer) {
          await prisma.user.update({
            where: { id: user.id },
            data: { referrerId: referrer.id }
          });

          // Create referral record
          await prisma.referral.create({
            data: {
              referrerId: referrer.id,
              joinerUserId: user.id,
            }
          });

          // Give reward to referrer
          await prisma.user.update({
            where: { id: referrer.id },
            data: {
              streak: { increment: 1 }
            }
          });
        }
      }
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { 
        userId: user.id, 
        tgId: user.tgId,
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        jwt: token,
        user: {
          id: user.id,
          tgId: user.tgId,
          username: user.username,
          createdAt: user.createdAt,
          referrerId: user.referrerId,
          isSubscribed: user.isSubscribed,
          subscriptionUntil: user.subscriptionUntil,
          streak: user.streak,
          lastDailyAt: user.lastDailyAt,
          referralCode: user.referralCode,
        },
        startParam: parsedData.start_param,
      }
    });
  } catch (error) {
    console.error('Auth validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default router;
