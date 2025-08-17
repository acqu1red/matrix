import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../hooks/useToast'

export default function Toast() {
  const { toasts, removeToast } = useToast()

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-glow-1 bg-glow-1 bg-opacity-10'
      case 'error':
        return 'border-red-400 bg-red-400 bg-opacity-10'
      case 'warning':
        return 'border-accent bg-accent bg-opacity-10'
      default:
        return 'border-glow-2 bg-glow-2 bg-opacity-10'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`glass rounded-2xl p-4 border ${getToastColor(toast.type)} min-w-64`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getToastIcon(toast.type)}</span>
              <p className="text-white text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
