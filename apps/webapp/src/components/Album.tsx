import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { apiClient } from '@/lib/api';
import { ArrowLeft, BookOpen, Gift, Share2, Crown, Sparkles } from 'lucide-react';
import { telegramManager } from '@/lib/telegram';

const Album = () => {
  const { config, totalFragments, streak, setCurrentView, addFragments, setStreak } = useAppStore();
  const [isDailyAvailable, setIsDailyAvailable] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    // Check if daily reward is available
    const lastDaily = localStorage.getItem('lastDailyClaim');
    if (lastDaily) {
      const lastClaim = new Date(lastDaily);
      const now = new Date();
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      setIsDailyAvailable(hoursSinceLastClaim >= 24);
    }
  }, []);

  const handleBack = () => {
    setCurrentView('map');
  };

  const handleDailyClaim = async () => {
    if (!isDailyAvailable || isClaiming) return;

    setIsClaiming(true);
    try {
      const response = await apiClient.claimDailyReward();
      if (response.success && response.data) {
        addFragments(response.data.fragments);
        setStreak(response.data.streak);
        setIsDailyAvailable(false);
        localStorage.setItem('lastDailyClaim', new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleShare = () => {
    const shareText = `🎮 Присоединяйся к Formula Private - Остров Архив!\n\nСобирай фрагменты, играй в мини-игры и получи доступ к эксклюзивным книгам.\n\nМой код: ${config?.season.id || 'ISLAND'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Formula Private',
        text: shareText,
        url: 'https://acqu1red.github.io/formulaprivate/island.html',
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
    }
  };

  if (!config) return null;

  const { season } = config;
  const progressPercentage = (totalFragments / (season.books.length * 7)) * 100;

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
          Коллекция
        </h1>
        
        <button
          onClick={handleShare}
          className="glass rounded-2xl p-3 shadow-elev-1"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-glass mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-glow-1" />
            <span className="text-white font-semibold">Всего фрагментов</span>
          </div>
          <span className="text-2xl font-bold text-glow-1">{totalFragments}</span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <motion.div
            className="bg-gradient-to-r from-glow-1 to-glow-2 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Прогресс коллекции</span>
          <span className="text-glow-1 font-semibold">{Math.round(progressPercentage)}%</span>
        </div>
      </motion.div>

      {/* Daily Reward */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-glass mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-glow-1 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-bg-0" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Ежедневная награда</h3>
              <p className="text-white/60 text-sm">Streak: {streak} дней</p>
            </div>
          </div>
          
          <button
            onClick={handleDailyClaim}
            disabled={!isDailyAvailable || isClaiming}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              isDailyAvailable && !isClaiming
                ? 'bg-gradient-to-r from-accent to-glow-1 text-bg-0 shadow-elev-2 hover:shadow-elev-3'
                : 'bg-white/20 text-white/60 cursor-not-allowed'
            } active:scale-95`}
          >
            {isClaiming ? 'Получаем...' : isDailyAvailable ? 'Получить' : 'Получено'}
          </button>
        </div>
        
        {isDailyAvailable && (
          <div className="text-glow-1 text-sm">
            🎁 +{5 + Math.floor(streak / 7) * 2} фрагментов за {streak + 1} день подряд
          </div>
        )}
      </motion.div>

      {/* Books Collection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-heading font-semibold text-white mb-4">
          Книги ({season.books.length})
        </h2>
        
        {season.books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="card-glass"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-glow-1 to-glow-2 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-bg-0" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{book.title}</h3>
                <p className="text-white/60 text-sm mb-2">{book.teaserText.slice(0, 60)}...</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-glow-1" />
                    <span className="text-white/80 text-sm">
                      {Math.min(totalFragments, book.fragmentsCount)}/{book.fragmentsCount}
                    </span>
                  </div>
                  
                  {totalFragments >= book.fragmentsCount ? (
                    <div className="flex items-center space-x-1 text-accent">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-semibold">Доступно</span>
                    </div>
                  ) : (
                    <span className="text-white/40 text-sm">
                      {book.fragmentsCount - totalFragments} осталось
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUnlock(false)}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent to-glow-1 rounded-3xl flex items-center justify-center">
                <Crown className="w-10 h-10 text-bg-0" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">
                Книга разблокирована!
              </h3>
              <p className="text-white/80">
                Теперь вы можете открыть книгу и читать её содержимое
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Album;
