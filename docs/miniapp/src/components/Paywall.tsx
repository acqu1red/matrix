import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTelegram } from '../hooks/useTelegram'
import { useGameStore } from '../store/gameStore'
import { useToast } from '../hooks/useToast'

export default function Paywall() {
  const { openLink } = useTelegram()
  const { closePaywall, checkSubscription } = useGameStore()
  const { showToast } = useToast()
  const [isChecking, setIsChecking] = useState(false)

  const handlePayment = (plan: 'week' | 'month') => {
    const paymentUrl = 'https://acqu1red.github.io/formulaprivate/payment.html'
    openLink(paymentUrl, { try_instant_view: false })
  }

  const handleCheckPayment = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/subscription/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.isSubscribed) {
          showToast('Подписка активна! Переходим в канал...', 'success')
          await checkSubscription()
          closePaywall()
        } else {
          showToast('Платёж пока не подтверждён. Попробуйте позже.', 'info')
        }
      } else {
        showToast('Ошибка проверки статуса', 'error')
      }
    } catch (error) {
      showToast('Ошибка сети', 'error')
    } finally {
      setIsChecking(false)
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
          onClick={closePaywall}
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
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-glow-1 to-glow-2 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">🔓</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Откройте полный доступ
            </h2>
            <p className="text-gray-300 text-sm">
              Получите доступ ко всем книгам и эксклюзивному контенту
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-glow-1">✨</span>
              <span className="text-white text-sm">Все книги без ограничений</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-glow-1">🚀</span>
              <span className="text-white text-sm">Эксклюзивный контент</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-glow-1">💎</span>
              <span className="text-white text-sm">Приоритетная поддержка</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-glow-1">🎁</span>
              <span className="text-white text-sm">Бонусные фрагменты</span>
            </div>
          </div>

          {/* Payment options */}
          <div className="space-y-3 mb-6">
            <motion.button
              className="w-full btn-primary"
              onClick={() => handlePayment('week')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="font-bold">7 дней</div>
                <div className="text-xs opacity-80">Быстрый старт</div>
              </div>
            </motion.button>

            <motion.button
              className="w-full btn-secondary"
              onClick={() => handlePayment('month')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="font-bold">30 дней</div>
                <div className="text-xs opacity-80">Рекомендуем</div>
              </div>
            </motion.button>
          </div>

          {/* Check payment button */}
          <motion.button
            className="w-full py-3 glass rounded-2xl text-white font-medium transition-all duration-300 hover:glass-strong"
            onClick={handleCheckPayment}
            disabled={isChecking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isChecking ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-glow-1 border-t-transparent rounded-full animate-spin"></div>
                <span>Проверяем...</span>
              </div>
            ) : (
              'Я оплатил(а)'
            )}
          </motion.button>

          {/* Close button */}
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
            onClick={closePaywall}
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
