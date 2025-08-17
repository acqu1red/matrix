import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { currentSeason, setSkin, closeSettings } = useGameStore()
  const { user, logout } = useAuth()

  const skins = [
    {
      id: 'neo-solarpunk',
      name: 'Neo-Solarpunk Holographic',
      description: 'Природа и технологии в гармонии',
      icon: '🌴',
      colors: ['#66F7D5', '#A6B4FF', '#FFE27A'],
    },
    {
      id: 'artdeco',
      name: 'Art-Deco Nocturne',
      description: 'Элегантность прошлого века',
      icon: '🏛️',
      colors: ['#D4AF37', '#1E3A8A', '#7C3AED'],
    },
    {
      id: 'synthwave',
      name: 'Retro-Synthwave',
      description: 'Будущее 80-х годов',
      icon: '🌆',
      colors: ['#FF0080', '#00FFFF', '#FFD700'],
    },
  ]

  const handleSkinChange = (skinId: string) => {
    setSkin(skinId as any)
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
          onClick={closeSettings}
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
              Настройки
            </h2>
            <p className="text-gray-300 text-sm">
              Персонализируйте свой опыт
            </p>
          </div>

          {/* User Info */}
          <div className="card-glass mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-glow-1 to-glow-2 flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.first_name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-xs text-gray-300">
                  @{user?.username || 'user'}
                </p>
              </div>
            </div>
          </div>

          {/* Skins */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-4">Визуальный стиль</h3>
            <div className="space-y-3">
              {skins.map((skin) => (
                <motion.div
                  key={skin.id}
                  className={`card-glass cursor-pointer transition-all ${
                    currentSeason?.skin === skin.id ? 'ring-2 ring-glow-1' : ''
                  }`}
                  onClick={() => handleSkinChange(skin.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{skin.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{skin.name}</h4>
                      <p className="text-xs text-gray-300">{skin.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      {skin.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="space-y-3 mb-6">
            <div className="card-glass">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white text-sm">Звуковые эффекты</h4>
                  <p className="text-xs text-gray-300">Включить звуки</p>
                </div>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <motion.div
                    className="w-5 h-5 bg-glow-1 rounded-full absolute top-0.5 left-0.5"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                  />
                </div>
              </div>
            </div>

            <div className="card-glass">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white text-sm">Вибрация</h4>
                  <p className="text-xs text-gray-300">Тактильная обратная связь</p>
                </div>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <motion.div
                    className="w-5 h-5 bg-glow-1 rounded-full absolute top-0.5 left-0.5"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              className="w-full btn-secondary"
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Выйти
            </motion.button>
          </div>

          {/* Close button */}
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:glass-strong transition-all"
            onClick={closeSettings}
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
