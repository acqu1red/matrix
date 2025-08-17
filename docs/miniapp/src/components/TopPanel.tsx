import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useAuth } from '../hooks/useAuth'

export default function TopPanel() {
  const { currentBook, totalFragments, streak, openCollection, openSettings } = useGameStore()
  // const { user } = useAuth()

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-10 p-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Book info */}
          <div className="flex items-center space-x-3">
            {currentBook && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-glow-1 to-glow-2 flex items-center justify-center">
                  <span className="text-white text-lg">📚</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {currentBook.title}
                  </h3>
                  <p className="text-xs text-gray-300">
                    Фрагменты: {totalFragments}/{currentBook.fragmentsCount}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center - Stats */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-glow-1">
                {totalFragments}
              </div>
              <div className="text-xs text-gray-300">Фрагментов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {streak}
              </div>
              <div className="text-xs text-gray-300">Дней подряд</div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
              onClick={openCollection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📚
            </motion.button>
            <motion.button
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
              onClick={openSettings}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        {currentBook && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Прогресс</span>
              <span>{Math.round((totalFragments / currentBook.fragmentsCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-glow-1 to-glow-2 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalFragments / currentBook.fragmentsCount) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
