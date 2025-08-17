import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { validateInitData, parseInitData } from '../lib/telegram.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tgId: string;
    username?: string;
  };
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing or invalid authorization header' 
      });
    }

    const initData = authHeader.substring(7);
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

    // Check if user exists
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
        }
      }
    }

    // Attach user to request
    req.user = {
      id: user.id,
      tgId: user.tgId,
      username: user.username || undefined,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
