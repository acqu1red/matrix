import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()

// HMAC validation for Telegram initData
function validateInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    if (!hash) return false

    // Remove hash from data
    urlParams.delete('hash')
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Create HMAC
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN || '')
      .digest()

    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    return calculatedHash === hash
  } catch (error) {
    console.error('HMAC validation error:', error)
    return false
  }
}

// Parse initData to get user info
function parseInitData(initData: string) {
  const urlParams = new URLSearchParams(initData)
  const userStr = urlParams.get('user')
  const startParam = urlParams.get('start_param')
  
  if (!userStr) return null
  
  try {
    const user = JSON.parse(userStr)
    return { user, startParam }
  } catch (error) {
    console.error('Parse initData error:', error)
    return null
  }
}

// POST /api/auth/validate
router.post('/validate', async (req, res) => {
  try {
    const { initData } = req.body

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' })
    }

    // Validate HMAC
    if (!validateInitData(initData)) {
      return res.status(401).json({ error: 'Invalid initData signature' })
    }

    // Parse user data
    const parsed = parseInitData(initData)
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid user data' })
    }

    const { user, startParam } = parsed

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { tgId: user.id.toString() }
    })

    if (!dbUser) {
      // Generate referral code
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      dbUser = await prisma.user.create({
        data: {
          tgId: user.id.toString(),
          username: user.username,
          referralCode,
        }
      })

      // Handle referral if present
      if (startParam?.startsWith('ref_')) {
        const referrerCode = startParam.replace('ref_', '')
        const referrer = await prisma.user.findUnique({
          where: { referralCode: referrerCode }
        })

        if (referrer && referrer.id !== dbUser.id) {
          await prisma.referral.create({
            data: {
              referrerId: referrer.id,
              joinerUserId: dbUser.id,
            }
          })

          // Give reward to referrer
          await prisma.user.update({
            where: { id: referrer.id },
            data: {
              // Add fragment reward logic here
            }
          })
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: dbUser.id, tgId: dbUser.tgId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      jwt: token,
      user: {
        id: dbUser.id,
        tgId: dbUser.tgId,
        username: dbUser.username,
        isSubscribed: dbUser.isSubscribed,
        subscriptionUntil: dbUser.subscriptionUntil,
        streak: dbUser.streak,
        referralCode: dbUser.referralCode,
      },
      startParam,
    })

  } catch (error) {
    console.error('Auth validation error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

export { router as authRoutes }
