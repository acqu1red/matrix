import { Router } from 'express'

const router = Router()

// GET /api/posts/teaser/:bookId
router.get('/teaser/:bookId', (req, res) => {
  res.json({ 
    message: 'Post teaser not implemented yet',
    note: 'Post content will be handled separately'
  })
})

export { router as postsRoutes }
