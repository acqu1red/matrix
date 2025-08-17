import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HoloRippleProps {
  onSuccess: () => void
}

export default function HoloRipple({ onSuccess }: HoloRippleProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timing: number }>>([])
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; active: boolean }>>([])
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const rippleIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    startGame()
    return () => {
      if (rippleIntervalRef.current) {
        clearInterval(rippleIntervalRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setHits(0)
    setMisses(0)
    
    // Create initial targets
    const initialTargets = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 20 + (i * 30),
      y: 50,
      active: false,
    }))
    setTargets(initialTargets)

    // Start ripple generation
    rippleIntervalRef.current = setInterval(() => {
      generateRipple()
    }, 2000)
  }

  const generateRipple = () => {
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = Math.random() * (rect.width - 100) + 50
    const y = Math.random() * (rect.height - 100) + 50
    const timing = Math.random() * 1000 + 500 // 500-1500ms

    const newRipple = {
      id: Date.now(),
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      timing,
    }

    setRipples(prev => [...prev, newRipple])

    // Activate random target
    setTargets(prev => prev.map(target => ({
      ...target,
      active: Math.random() < 0.3, // 30% chance
    })))

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 2000)
  }

  const handleRippleClick = (rippleId: number) => {
    // Check if any target is active
    const hasActiveTarget = targets.some(target => target.active)
    
    if (hasActiveTarget) {
      setHits(prev => prev + 1)
      setScore(prev => prev + 10)
      
      // Deactivate all targets
      setTargets(prev => prev.map(target => ({ ...target, active: false })))
      
      // Check win condition
      if (hits + 1 >= 3) {
        setIsPlaying(false)
        if (rippleIntervalRef.current) {
          clearInterval(rippleIntervalRef.current)
        }
        setTimeout(onSuccess, 500)
      }
    } else {
      setMisses(prev => prev + 1)
      setScore(prev => Math.max(0, prev - 5))
    }

    // Remove the clicked ripple
    setRipples(prev => prev.filter(r => r.id !== rippleId))
  }

  return (
    <div className="w-full h-full">
      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-64 bg-bg-1 rounded-2xl border border-glow-1 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, rgba(102, 247, 213, 0.1) 0%, transparent 70%)',
        }}
      >
        {/* Targets */}
        {targets.map((target) => (
          <motion.div
            key={target.id}
            className={`absolute w-8 h-8 rounded-full border-2 ${
              target.active 
                ? 'border-glow-1 bg-glow-1 bg-opacity-30' 
                : 'border-gray-500 bg-gray-500 bg-opacity-20'
            }`}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: target.active ? [1, 1.2, 1] : 1,
              opacity: target.active ? [0.5, 1, 0.5] : 0.3,
            }}
            transition={{
              duration: 1,
              repeat: target.active ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute w-16 h-16 rounded-full border-2 border-glow-1 cursor-pointer"
              style={{
                left: `${ripple.x}%`,
                top: `${ripple.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleRippleClick(ripple.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full border border-glow-1"
                animate={{
                  scale: [1, 2, 3],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-xs text-gray-300">
            Нажмите на волны когда мишени активны
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-4 text-sm">
          <div>
            <span className="text-glow-1">Попадания:</span> {hits}
          </div>
          <div>
            <span className="text-red-400">Промахи:</span> {misses}
          </div>
          <div>
            <span className="text-accent">Счёт:</span> {score}
          </div>
        </div>
      </div>
    </div>
  )
}
