import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get book teaser
router.get('/teaser/:bookId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: {
        text: book.teaserText,
        imageUrl: book.teaserImageUrl,
      }
    });
  } catch (error) {
    console.error('Book teaser error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get book teaser'
    });
  }
});

export default router;
