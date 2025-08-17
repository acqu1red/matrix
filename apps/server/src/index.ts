import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Bot } from 'grammy';
import { run } from '@grammyjs/runner';

// Load environment variables
config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import progressRoutes from './routes/progress.js';
import rewardsRoutes from './routes/rewards.js';
import subscriptionRoutes from './routes/subscription.js';
import membershipRoutes from './routes/membership.js';
import postsRoutes from './routes/posts.js';

// Use routes
app.use('/auth', authRoutes);
app.use('/config', configRoutes);
app.use('/progress', progressRoutes);
app.use('/rewards', rewardsRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/membership', membershipRoutes);
app.use('/posts', postsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Initialize Telegram bot
if (process.env.BOT_TOKEN) {
  const bot = new Bot(process.env.BOT_TOKEN);
  
  // Import bot handlers
  import './bot/handlers.js';
  
  // Start bot
  run(bot);
  console.log('🤖 Telegram bot started');
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
