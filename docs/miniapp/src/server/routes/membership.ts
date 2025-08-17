import { Router } from 'express'

const router = Router()

// POST /api/membership/invite
router.post('/invite', (req, res) => {
  res.json({ 
    message: 'Membership invite not implemented yet',
    note: 'Channel access will be handled separately'
  })
})

export { router as membershipRoutes }
