import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import HoloRipple from './minigames/HoloRipple'
import GlyphDial from './minigames/GlyphDial'
import Constellation from './minigames/Constellation'

interface MinigameModalProps {
  minigame: {
    type: 'ripple' | 'dial' | 'constellation'
    hotspot: any
    progress: number
    completed: boolean
  }
  onComplete: (success: boolean) => void
  onClose: () => void
}

export default function MinigameModal({ minigame, onComplete, onClose }: MinigameModalProps) {
  const [timeLeft, setTimeLeft] = useState(20)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0 && !isCompleted) {
      onComplete(false)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isCompleted, onComplete])

  const handleSuccess = () => {
    setIsCompleted(true)
    setTimeout(() => {
      onComplete(true)
    }, 1000)
  }

  const getMinigameTitle = (type: string) => {
    switch (type) {
      case 'ripple':
        return 'Holo-Ripple Sync'
      case 'dial':
        return 'Glyph Dial'
      case 'constellation':
        return 'Constellation Trace'
      default:
        return 'Мини-игра'
    }
  }

  const getMinigameDescription = (type: string) => {
    switch (type) {
      case 'ripple':
        return 'Синхронизируйтесь с волнами и нажмите в нужный момент'
      case 'dial':
        return 'Поверните диск до подсвеченного сектора'
      case 'constellation':
        return 'Проведите линию через звёзды по подсказке'
      default:
        return 'Пройдите мини-игру для получения награды'
    }
  }

  const renderMinigame = () => {
    switch (minigame.type) {
      case 'ripple':
        return <HoloRipple onSuccess={handleSuccess} />
      case 'dial':
        return <GlyphDial onSuccess={handleSuccess} />
      case 'constellation':
        return <Constellation onSuccess={handleSuccess} />
      default:
        return <div>Неизвестная игра</div>
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
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg glass rounded-3xl p-6"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {getMinigameTitle(minigame.type)}
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              {getMinigameDescription(minigame.type)}
            </p>
            
            {/* Timer */}
            <div className="flex items-center justify-center space-x-2">
              <div className="text-sm text-gray-300">Время:</div>
              <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-glow-1'}`}>
                {timeLeft}s
              </div>
            </div>
          </div>

          {/* Game area */}
          <div className="relative min-h-[300px] flex items-center justify-center">
            {renderMinigame()}
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    🎉
                  </motion.div>
                  <div className="text-2xl font-bold text-glow-1 mb-2">
                    Успех!
                  </div>
                  <div className="text-gray-300">
                    +{minigame.hotspot.baseReward} фрагментов
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
