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

// GET /api/subscription/status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if subscription is still valid
    const now = new Date()
    const isSubscribed = user.isSubscribed && 
      user.subscriptionUntil && 
      new Date(user.subscriptionUntil) > now

    // Update subscription status if expired
    if (user.isSubscribed && !isSubscribed) {
      await prisma.user.update({
        where: { id: userId },
        data: { isSubscribed: false },
      })
    }

    res.json({
      isSubscribed,
      subscriptionUntil: user.subscriptionUntil,
    })

  } catch (error) {
    console.error('Subscription status error:', error)
    res.status(500).json({ error: 'Failed to get subscription status' })
  }
})

// POST /api/subscription/check
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // This is a placeholder for actual payment verification
    // In a real implementation, you would check with your payment provider
    // For now, we'll simulate a successful payment check

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Simulate payment verification
    // In reality, you would check with your payment provider here
    const hasRecentPayment = await prisma.payment.findFirst({
      where: {
        userId,
        status: 'paid',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })

    if (hasRecentPayment) {
      // Grant subscription
      const subscriptionEnd = new Date()
      subscriptionEnd.setDate(subscriptionEnd.getDate() + (hasRecentPayment.plan === 'week' ? 7 : 30))

      await prisma.user.update({
        where: { id: userId },
        data: {
          isSubscribed: true,
          subscriptionUntil: subscriptionEnd,
        },
      })

      res.json({
        isSubscribed: true,
        subscriptionUntil: subscriptionEnd,
        message: 'Подписка активирована!',
      })
    } else {
      res.json({
        isSubscribed: false,
        message: 'Платёж пока не подтверждён',
      })
    }

  } catch (error) {
    console.error('Subscription check error:', error)
    res.status(500).json({ error: 'Failed to check subscription' })
  }
})

export { router as subscriptionRoutes }
