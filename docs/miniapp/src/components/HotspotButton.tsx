import { motion, AnimatePresence } from 'framer-motion'
import { Hotspot } from '../store/gameStore'

interface HotspotButtonProps {
  hotspot: Hotspot
  onClick: () => void
  isActive?: boolean
}

export default function HotspotButton({ hotspot, onClick, isActive }: HotspotButtonProps) {
  const getHotspotIcon = (type: string, minigame?: string) => {
    switch (type) {
      case 'tap':
        return '✨'
      case 'hold':
        return '💎'
      case 'minigame':
        switch (minigame) {
          case 'ripple':
            return '🌊'
          case 'dial':
            return '⚙️'
          case 'constellation':
            return '⭐'
          default:
            return '🎮'
        }
      default:
        return '✨'
    }
  }

  const getHotspotColor = (type: string) => {
    switch (type) {
      case 'tap':
        return 'from-glow-1 to-glow-2'
      case 'hold':
        return 'from-accent to-glow-1'
      case 'minigame':
        return 'from-glow-2 to-accent'
      default:
        return 'from-glow-1 to-glow-2'
    }
  }

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: Math.random() * 0.5, duration: 0.6, ease: "backOut" }}
    >
      <motion.button
        className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getHotspotColor(hotspot.type)} 
                   shadow-glow cursor-pointer transition-all duration-300 
                   hover:shadow-glow-strong hover:scale-110 active:scale-95
                   ${isActive ? 'ring-2 ring-white ring-opacity-50' : ''}`}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(102, 247, 213, 0.4)',
            '0 0 32px rgba(102, 247, 213, 0.6)',
            '0 0 20px rgba(102, 247, 213, 0.4)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
          {getHotspotIcon(hotspot.type, hotspot.minigame)}
        </div>

        {/* Reward indicator */}
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-bg-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          +{hotspot.baseReward}
        </motion.div>

        {/* Minigame indicator */}
        {hotspot.type === 'minigame' && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-glow-2 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </motion.button>

      {/* Floating particles around hotspot */}
      <AnimatePresence>
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-glow-1 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 40,
                  y: Math.sin((i * 60) * Math.PI / 180) * 40,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
