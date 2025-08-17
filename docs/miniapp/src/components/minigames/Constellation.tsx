import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Star {
  id: number
  x: number
  y: number
  connected: boolean
}

interface ConstellationProps {
  onSuccess: () => void
}

export default function Constellation({ onSuccess }: ConstellationProps) {
  const [stars, setStars] = useState<Star[]>([])
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [targetPath, setTargetPath] = useState<number[]>([])
  const [currentStarIndex, setCurrentStarIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startGame()
  }, [])

  const startGame = () => {
    // Generate random stars
    const newStars: Star[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 80 + 10, // 10-90%
      connected: false,
    }))
    setStars(newStars)

    // Generate target path (connect all stars in sequence)
    const path = Array.from({ length: 5 }, (_, i) => i)
    setTargetPath(path)
    setCurrentStarIndex(0)
    setCurrentPath([])
    setIsCompleted(false)
  }

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    setCurrentPath([])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setCurrentPath(prev => [...prev, { x, y }])

    // Check if near any star
    stars.forEach((star, index) => {
      if (!star.connected && getDistance(x, y, star.x, star.y) < 8) {
        if (index === currentStarIndex) {
          // Correct star
          setStars(prev => prev.map((s, i) => 
            i === index ? { ...s, connected: true } : s
          ))
          setCurrentStarIndex(prev => prev + 1)
          
          if (currentStarIndex + 1 >= stars.length) {
            setIsCompleted(true)
            setTimeout(onSuccess, 1000)
          }
        }
      }
    })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setCurrentPath([])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    setCurrentPath([])
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100

    setCurrentPath(prev => [...prev, { x, y }])

    // Check if near any star
    stars.forEach((star, index) => {
      if (!star.connected && getDistance(x, y, star.x, star.y) < 8) {
        if (index === currentStarIndex) {
          setStars(prev => prev.map((s, i) => 
            i === index ? { ...s, connected: true } : s
          ))
          setCurrentStarIndex(prev => prev + 1)
          
          if (currentStarIndex + 1 >= stars.length) {
            setIsCompleted(true)
            setTimeout(onSuccess, 1000)
          }
        }
      }
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(false)
    setCurrentPath([])
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Game area */}
      <div
        ref={canvasRef}
        className="relative w-full h-64 bg-bg-1 rounded-2xl border border-glow-1 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, rgba(166, 180, 255, 0.1) 0%, transparent 70%)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stars */}
        {stars.map((star, index) => (
          <motion.div
            key={star.id}
            className={`absolute w-4 h-4 rounded-full cursor-pointer ${
              star.connected 
                ? 'bg-glow-1 shadow-glow' 
                : index === currentStarIndex 
                  ? 'bg-accent shadow-glow-strong' 
                  : 'bg-gray-400'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: star.connected ? 1.2 : 1,
              opacity: 1,
            }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            {/* Star number */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white">
              {index + 1}
            </div>
          </motion.div>
        ))}

        {/* Current drawing path */}
        {currentPath.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M ${currentPath.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
              stroke="url(#glowGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#66F7D5" />
                <stop offset="100%" stopColor="#A6B4FF" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Connected lines */}
        {stars.map((star, index) => {
          if (index < stars.length - 1 && star.connected) {
            const nextStar = stars[index + 1]
            return (
              <svg key={`line-${index}`} className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={`${star.x}%`}
                  y1={`${star.y}%`}
                  x2={`${nextStar.x}%`}
                  y2={`${nextStar.y}%`}
                  stroke="#66F7D5"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )
          }
          return null
        })}

        {/* Success overlay */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-glow-1 font-bold">Созвездие завершено!</div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-xs text-gray-300">
            Соедините звёзды в правильном порядке
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 text-center">
        <div className="text-sm">
          <span className="text-glow-1">Прогресс:</span> {currentStarIndex}/{stars.length}
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-glow-1 to-glow-2"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStarIndex / stars.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
