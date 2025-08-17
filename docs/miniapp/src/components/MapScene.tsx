import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'
import HotspotButton from './HotspotButton'
import ParticleSystem from './ParticleSystem'
import TopPanel from './TopPanel'
import BookPreview from './BookPreview'
import MinigameModal from './MinigameModal'
import { useToast } from '../hooks/useToast'

export default function MapScene() {
  const {
    currentSeason,
    activeHotspot,
    activeMinigame,
    openHotspot,
    closeHotspot,
    startMinigame,
    totalFragments,
    isSubscribed,
  } = useGameStore()
  
  const { showToast } = useToast()
  const { showBackButton, hideBackButton } = useTelegram()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Parallax motion values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const bgX = useTransform(mouseX, [-1, 1], [-20, 20])
  const bgY = useTransform(mouseY, [-1, 1], [-10, 10])
  const midX = useTransform(mouseX, [-1, 1], [-12, 12])
  const midY = useTransform(mouseY, [-1, 1], [-6, 6])
  const fgX = useTransform(mouseX, [-1, 1], [-18, 18])
  const fgY = useTransform(mouseY, [-1, 1], [-9, 9])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      setMousePosition({ x, y })
      mouseX.set(x * 2 - 1)
      mouseY.set(y * 2 - 1)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.touches[0].clientX - rect.left) / rect.width
      const y = (e.touches[0].clientY - rect.top) / rect.height
      
      setMousePosition({ x, y })
      mouseX.set(x * 2 - 1)
      mouseY.set(y * 2 - 1)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [mouseX, mouseY])

  useEffect(() => {
    if (activeHotspot || activeMinigame) {
      showBackButton(() => {
        closeHotspot()
        showToast('Хотспот закрыт', 'info')
      })
    } else {
      hideBackButton()
    }
  }, [activeHotspot, activeMinigame, showBackButton, hideBackButton, closeHotspot, showToast])

  const handleHotspotClick = (hotspot: any) => {
    if (hotspot.type === 'minigame') {
      startMinigame(hotspot)
    } else {
      openHotspot(hotspot)
    }
  }

  if (!currentSeason) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glow-1 mx-auto mb-4"></div>
          <p className="text-glow-1">Загрузка острова...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-bg-0"
      style={{
        background: `radial-gradient(120% 80% at 70% 30%, #12344B 0%, #0B1020 60%, #090D18 100%)`
      }}
    >
      {/* Background Layer */}
      <motion.div
        className="absolute inset-0 parallax-bg"
        style={{
          x: bgX,
          y: bgY,
          backgroundImage: `url(${currentSeason.mapAssets.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Mid Layer */}
      <motion.div
        className="absolute inset-0 parallax-mid"
        style={{
          x: midX,
          y: midY,
          backgroundImage: `url(${currentSeason.mapAssets.mid})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Foreground Layer */}
      <motion.div
        className="absolute inset-0 parallax-fg"
        style={{
          x: fgX,
          y: fgY,
          backgroundImage: `url(${currentSeason.mapAssets.fg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Fog Layer */}
      {currentSeason.mapAssets.fog && (
        <motion.div
          className="absolute inset-0 animate-fog-drift"
          style={{
            backgroundImage: `url(${currentSeason.mapAssets.fog})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />
      )}

      {/* Particle System */}
      <ParticleSystem />

      {/* Hotspots */}
      {currentSeason.hotspots.map((hotspot) => (
        <HotspotButton
          key={hotspot.id}
          hotspot={hotspot}
          onClick={() => handleHotspotClick(hotspot)}
          isActive={activeHotspot?.id === hotspot.id}
        />
      ))}

      {/* Top Panel */}
      <TopPanel />

      {/* Book Preview Modal */}
      {activeHotspot && activeHotspot.type !== 'minigame' && (
        <BookPreview
          hotspot={activeHotspot}
          onClose={closeHotspot}
          onCollect={() => {
            // Handle fragment collection
            showToast(`+${activeHotspot.baseReward} фрагментов!`, 'success')
            closeHotspot()
          }}
        />
      )}

      {/* Minigame Modal */}
      {activeMinigame && (
        <MinigameModal
          minigame={activeMinigame}
          onComplete={(success) => {
            if (success) {
              showToast(`+${activeMinigame.hotspot.baseReward} фрагментов!`, 'success')
            }
          }}
          onClose={closeHotspot}
        />
      )}

      {/* Paywall Trigger */}
      {!isSubscribed && totalFragments >= 20 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={() => useGameStore.getState().openPaywall()}
            className="btn-primary text-sm"
          >
            🔓 Открыть полный доступ
          </button>
        </motion.div>
      )}
    </div>
  )
}
