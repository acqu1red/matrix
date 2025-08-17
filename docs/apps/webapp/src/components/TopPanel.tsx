import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { Sparkles, BookOpen, Crown } from 'lucide-react';

const TopPanel = () => {
  const {
    config,
    totalFragments,
    streak,
    setCurrentView,
  } = useAppStore();

  if (!config) return null;

  const { season } = config;
  const featuredBook = season.books[0]; // First book as featured

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass rounded-3xl p-4 shadow-elev-2"
      >
        <div className="flex items-center justify-between">
          {/* Left side - Stats */}
          <div className="flex items-center space-x-4">
            {/* Fragments counter */}
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-glow-1" />
              <span className="text-white font-semibold">{totalFragments}</span>
            </div>

            {/* Streak counter */}
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-accent" />
              <span className="text-white font-semibold">{streak}</span>
            </div>
          </div>

          {/* Right side - Featured book */}
          {featuredBook && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('book')}
              className="flex items-center space-x-3 glass rounded-2xl p-3 shadow-elev-1"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-glow-1 to-glow-2 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-bg-0" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">Книга недели</p>
                <p className="text-glow-1 text-xs">{featuredBook.title}</p>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TopPanel;
