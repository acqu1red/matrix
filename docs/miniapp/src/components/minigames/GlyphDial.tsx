import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface GlyphDialProps {
  onSuccess: () => void
}

export default function GlyphDial({ onSuccess }: GlyphDialProps) {
  const [currentTarget, setCurrentTarget] = useState(0)
  const [dialRotation, setDialRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hits, setHits] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const dialRef = useRef<HTMLDivElement>(null)
  const rotation = useMotionValue(0)
  const rotateX = useTransform(rotation, (value) => `${value}deg`)

  const segments = 8
  const segmentAngle = 360 / segments
  const targetAngle = currentTarget * segmentAngle

  useEffect(() => {
    startGame()
  }, [])

  const startGame = () => {
    setHits(0)
    setIsCompleted(false)
    setCurrentTarget(Math.floor(Math.random() * segments))
    setDialRotation(0)
    rotation.set(0)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    checkAlignment()
  }

  const checkAlignment = () => {
    const currentAngle = rotation.get() % 360
    const targetAngleNormalized = targetAngle % 360
    const difference = Math.abs(currentAngle - targetAngleNormalized)
    
    // Check if aligned within 15 degrees
    if (difference <= 15 || difference >= 345) {
      setHits(prev => {
        const newHits = prev + 1
        if (newHits >= 2) {
          setIsCompleted(true)
          setTimeout(onSuccess, 1000)
        } else {
          // Set new target
          setCurrentTarget(Math.floor(Math.random() * segments))
        }
        return newHits
      })
    }
  }

  const handleDrag = (event: any, info: any) => {
    const newRotation = rotation.get() + info.delta.x * 0.5
    rotation.set(newRotation)
    setDialRotation(newRotation)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Game area */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Target indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-2 h-8 bg-glow-1 rounded-full"
            style={{
              transform: `rotate(${targetAngle}deg)`,
            }}
          />
        </div>

        {/* Dial */}
        <motion.div
          ref={dialRef}
          className="relative w-48 h-48 rounded-full border-4 border-glow-2 bg-bg-1 cursor-grab active:cursor-grabbing"
          style={{ rotate: rotateX }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={handleDrag}
          whileDrag={{ scale: 1.05 }}
        >
          {/* Segment markers */}
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-6 bg-gray-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * segmentAngle}deg) translateY(-24px)`,
                transformOrigin: 'center',
              }}
            />
          ))}

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-glow-1 to-glow-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Success indicator */}
          {isCompleted && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-4xl">🎉</div>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-300">
            Поверните диск до подсвеченного сектора
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-sm">
            <span className="text-glow-1">Попадания:</span> {hits}/2
          </div>
          <div className="text-sm">
            <span className="text-accent">Угол:</span> {Math.round(dialRotation)}°
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-glow-1 to-glow-2"
            initial={{ width: 0 }}
            animate={{ width: `${(hits / 2) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
