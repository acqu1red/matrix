import { Router } from 'express'

const router = Router()

// POST /api/payments/create-invoice
router.post('/create-invoice', (req, res) => {
  res.json({ 
    message: 'Payment integration not implemented yet',
    note: 'Payments are handled through external Mini App'
  })
})

// POST /api/payments/webhook
router.post('/webhook', (req, res) => {
  res.json({ message: 'Webhook received' })
})

export { router as paymentsRoutes }
