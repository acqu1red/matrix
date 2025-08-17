import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAppStore } from '@/store';
import { audioManager } from '@/lib/audio';
import { apiClient } from '@/lib/api';
import { Hotspot } from '@/types';
import HotspotButton from './HotspotButton';
import ParticleSystem from './ParticleSystem';
import TopPanel from './TopPanel';
import MinigameModal from './MinigameModal';
import { Sparkles, BookOpen, Settings } from 'lucide-react';

const MapScene = () => {
  const {
    config,
    totalFragments,
    streak,
    setCurrentView,
    addFragments,
    setMinigameState,
    resetMinigame,
  } = useAppStore();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastCollectTime, setLastCollectTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const bgX = useTransform(mouseX, [-1, 1], [-20, 20]);
  const bgY = useTransform(mouseY, [-1, 1], [-10, 10]);
  const midX = useTransform(mouseX, [-1, 1], [-40, 40]);
  const midY = useTransform(mouseY, [-1, 1], [-20, 20]);
  const fgX = useTransform(mouseX, [-1, 1], [-60, 60]);
  const fgY = useTransform(mouseY, [-1, 1], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [mouseX, mouseY]);

  const handleHotspotClick = async (hotspot: Hotspot) => {
    const now = Date.now();
    if (now - lastCollectTime < 1500) return; // Cooldown

    setLastCollectTime(now);

    if (hotspot.type === 'minigame') {
      setMinigameState({
        isActive: true,
        type: hotspot.minigame || 'ripple',
        progress: 0,
        score: 0,
        timeLeft: 20,
      });
      return;
    }

    // Regular tap/hold collection
    try {
      const response = await apiClient.collectFragment(hotspot.id);
      if (response.success && response.data) {
        const { fragments, isGold } = response.data;
        addFragments(fragments);
        
        // Play sound and haptic feedback
        audioManager.playSound(isGold ? 'success' : 'collect');
        if (navigator.vibrate) {
          navigator.vibrate(isGold ? 50 : 20);
        }
      }
    } catch (error) {
      console.error('Failed to collect fragment:', error);
      audioManager.playSound('error');
    }
  };

  const handleMinigameComplete = async (hotspotId: string, score: number) => {
    try {
      const response = await apiClient.collectFragment(hotspotId);
      if (response.success && response.data) {
        const { fragments, isGold } = response.data;
        addFragments(fragments);
        
        audioManager.playSound(isGold ? 'success' : 'collect');
        if (navigator.vibrate) {
          navigator.vibrate(isGold ? 50 : 20);
        }
      }
    } catch (error) {
      console.error('Failed to collect minigame reward:', error);
    }
    
    resetMinigame();
  };

  if (!config) return null;

  const { season } = config;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-bg-0"
      style={{
        background: `radial-gradient(120% 80% at 70% 30%, #12344B 0%, #0B1020 60%, #090D18 100%)`,
      }}
    >
      {/* Parallax Background Layer */}
      <motion.div
        className="absolute inset-0 parallax-bg"
        style={{
          x: bgX,
          y: bgY,
          backgroundImage: `url(${season.mapBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Parallax Mid Layer */}
      <motion.div
        className="absolute inset-0 parallax-mid"
        style={{
          x: midX,
          y: midY,
          backgroundImage: `url(${season.mapMidUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Parallax Foreground Layer */}
      <motion.div
        className="absolute inset-0 parallax-fg"
        style={{
          x: fgX,
          y: fgY,
          backgroundImage: `url(${season.mapFgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Fog Layer */}
      {season.fogUrl && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${season.fogUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
          animate={{
            x: [0, 10, 0],
            y: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Particle System */}
      <ParticleSystem />

      {/* Hotspots */}
      {season.hotspots.map((hotspot) => (
        <HotspotButton
          key={hotspot.id}
          hotspot={hotspot}
          onClick={() => handleHotspotClick(hotspot)}
        />
      ))}

      {/* Top Panel */}
      <TopPanel />

      {/* Bottom Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('album')}
            className="glass rounded-2xl p-3 shadow-elev-1"
          >
            <BookOpen className="w-6 h-6 text-glow-1" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('settings')}
            className="glass rounded-2xl p-3 shadow-elev-1"
          >
            <Settings className="w-6 h-6 text-glow-2" />
          </motion.button>
        </div>
      </div>

      {/* Minigame Modal */}
      <MinigameModal onComplete={handleMinigameComplete} />
    </div>
  );
};

export default MapScene;
