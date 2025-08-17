import { motion, AnimatePresence } from 'framer-motion'
import { Hotspot } from '../store/gameStore'

interface BookPreviewProps {
  hotspot: Hotspot
  onClose: () => void
  onCollect: () => void
}

export default function BookPreview({ hotspot, onClose, onCollect }: BookPreviewProps) {
  const getHotspotTitle = (type: string) => {
    switch (type) {
      case 'tap':
        return 'Быстрый сбор'
      case 'hold':
        return 'Мощный сбор'
      case 'minigame':
        return 'Мини-игра'
      default:
        return 'Фрагмент'
    }
  }

  const getHotspotDescription = (type: string) => {
    switch (type) {
      case 'tap':
        return 'Нажмите для быстрого сбора фрагментов'
      case 'hold':
        return 'Удерживайте для мощного сбора с бонусом'
      case 'minigame':
        return 'Пройдите мини-игру для получения награды'
      default:
        return 'Соберите фрагменты знаний'
    }
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
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md glass rounded-3xl p-6"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {getHotspotTitle(hotspot.type)}
            </h2>
            <p className="text-gray-300 text-sm">
              {getHotspotDescription(hotspot.type)}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Reward display */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-glow-1 to-glow-2 mb-3">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-3xl font-bold text-glow-1">
                +{hotspot.baseReward}
              </div>
              <div className="text-sm text-gray-300">фрагментов</div>
            </div>

            {/* Book preview */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-glow-1 to-glow-2 flex items-center justify-center">
                  <span className="text-white text-lg">📚</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">
                    Формула Успеха
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Откройте секреты успешных людей и узнайте, как применить их опыт в своей жизни...
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <motion.button
                className="flex-1 btn-secondary"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Отмена
              </motion.button>
              <motion.button
                className="flex-1 btn-primary"
                onClick={onCollect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Собрать
              </motion.button>
            </div>
          </div>

          {/* Close button */}
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
            onClick={onClose}
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
