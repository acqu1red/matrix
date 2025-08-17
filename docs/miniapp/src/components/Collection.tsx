import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function Collection() {
  const { books, progress, totalFragments, streak, lastDailyAt, claimDailyReward, closeCollection } = useGameStore()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isClaiming, setIsClaiming] = useState(false)

  const canClaimDaily = () => {
    if (!lastDailyAt) return true
    const lastClaim = new Date(lastDailyAt)
    const now = new Date()
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
    return diffHours >= 24
  }

  const handleDailyClaim = async () => {
    if (!canClaimDaily()) {
      showToast('Ежедневная награда уже получена', 'warning')
      return
    }

    setIsClaiming(true)
    try {
      await claimDailyReward()
      showToast('Ежедневная награда получена!', 'success')
    } catch (error) {
      showToast('Ошибка получения награды', 'error')
    } finally {
      setIsClaiming(false)
    }
  }

  const copyReferralLink = () => {
    const link = `https://t.me/your_bot?start=ref_${user?.referralCode}`
    navigator.clipboard.writeText(link)
    showToast('Ссылка скопирована!', 'success')
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCollection}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg glass rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Коллекция
            </h2>
            <p className="text-gray-300 text-sm">
              Ваши достижения и награды
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card-glass text-center">
              <div className="text-2xl font-bold text-glow-1">{totalFragments}</div>
              <div className="text-xs text-gray-300">Всего фрагментов</div>
            </div>
            <div className="card-glass text-center">
              <div className="text-2xl font-bold text-accent">{streak}</div>
              <div className="text-xs text-gray-300">Дней подряд</div>
            </div>
          </div>

          {/* Daily Reward */}
          <div className="card-glass mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Ежедневный сундук</h3>
                <p className="text-xs text-gray-300">
                  {canClaimDaily() ? 'Готов к открытию!' : 'Доступен завтра'}
                </p>
              </div>
              <div className="text-2xl">🎁</div>
            </div>
            
            <motion.button
              className={`w-full py-3 rounded-2xl font-medium transition-all ${
                canClaimDaily() 
                  ? 'btn-primary' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleDailyClaim}
              disabled={!canClaimDaily() || isClaiming}
              whileHover={canClaimDaily() ? { scale: 1.02 } : {}}
              whileTap={canClaimDaily() ? { scale: 0.98 } : {}}
            >
              {isClaiming ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Открываем...</span>
                </div>
              ) : (
                canClaimDaily() ? 'Открыть сундук' : 'Уже получен'
              )}
            </motion.button>
          </div>

          {/* Books Collection */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-4">Книги</h3>
            <div className="space-y-3">
              {books.map((book) => {
                const bookProgress = progress.find(p => p.bookId === book.id)
                const fragments = bookProgress?.fragments || 0
                const percentage = (fragments / book.fragmentsCount) * 100

                return (
                  <div key={book.id} className="card-glass">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-glow-1 to-glow-2 flex items-center justify-center">
                        <span className="text-white text-lg">📚</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{book.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="h-full bg-gradient-to-r from-glow-1 to-glow-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <span className="text-xs text-gray-300">
                            {fragments}/{book.fragmentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Referral */}
          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Пригласите друзей</h3>
                <p className="text-xs text-gray-300">
                  Получите +1 фрагмент за каждого друга
                </p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            
            <motion.button
              className="w-full btn-secondary"
              onClick={copyReferralLink}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Поделиться ссылкой
            </motion.button>
          </div>

          {/* Close button */}
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
            onClick={closeCollection}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
