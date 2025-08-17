import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { telegramManager } from '@/lib/telegram';

const BookPreview = () => {
  const { config, setCurrentView } = useAppStore();

  if (!config) return null;

  const { season } = config;
  const book = season.books[0]; // Featured book

  const handleBack = () => {
    setCurrentView('map');
  };

  const handleOpenBook = () => {
    // Open the book in Telegram channel
    const channelUrl = `https://t.me/c/${book.channelId.slice(4)}/${book.channelPostId}`;
    telegramManager.openLink(channelUrl);
  };

  const handleCollectFragments = () => {
    // Navigate to paywall if not enough fragments
    setCurrentView('paywall');
  };

  return (
    <div className="min-h-screen bg-bg-0 p-4">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={handleBack}
          className="glass rounded-2xl p-3 shadow-elev-1"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <h1 className="text-xl font-heading font-semibold text-white">
          Книга недели
        </h1>
        
        <div className="w-11" /> {/* Spacer */}
      </motion.div>

      {/* Book Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-glass mb-6"
      >
        {/* Book Cover */}
        <div className="relative mb-6">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-glow-1 to-glow-2">
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-bg-0" />
            </div>
          </div>
          
          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Прогресс</span>
                <span className="text-glow-1 text-sm font-semibold">3/7</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-glow-1 to-glow-2 h-2 rounded-full"
                  style={{ width: '43%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-white">
            {book.title}
          </h2>
          
          <p className="text-white/80 leading-relaxed">
            {book.teaserText}
          </p>
          
          <div className="flex items-center space-x-2 text-glow-1 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Фрагментов: {book.fragmentsCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <button
          onClick={handleOpenBook}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Открыть книгу</span>
        </button>
        
        <button
          onClick={handleCollectFragments}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Собрать фрагменты</span>
        </button>
      </motion.div>
    </div>
  );
};

export default BookPreview;
