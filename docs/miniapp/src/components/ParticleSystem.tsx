import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

export default function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate initial particles
    const initialParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 8 + 8, // 8-16 seconds
      delay: Math.random() * 5,
    }))

    setParticles(initialParticles)

    // Add new particles periodically
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticle: Particle = {
          id: Date.now(),
          x: -5, // Start off-screen
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 12 + 8,
          delay: 0,
        }
        return [...prev.slice(-20), newParticle] // Keep max 20 particles
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-glow-1 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: ['0vw', '105vw'],
            y: ['0vh', '-5vh'],
            opacity: [0, particle.opacity, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}

      {/* Additional floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute w-1 h-1 bg-glow-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Glow orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute w-8 h-8 rounded-full"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
            background: `radial-gradient(circle, rgba(102, 247, 213, 0.3) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}
