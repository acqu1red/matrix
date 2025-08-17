import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { audioManager } from '@/lib/audio';
import { X, Target, RotateCcw, Star } from 'lucide-react';

interface MinigameModalProps {
  onComplete: (hotspotId: string, score: number) => void;
}

const MinigameModal = ({ onComplete }: MinigameModalProps) => {
  const { minigame, resetMinigame } = useAppStore();
  const [gameState, setGameState] = useState({
    rippleHits: 0,
    dialAngle: 0,
    constellationPath: [] as { x: number; y: number }[],
  });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (minigame.isActive) {
      startGame();
    } else {
      cleanup();
    }

    return cleanup;
  }, [minigame.isActive, minigame.type]);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startGame = () => {
    setGameState({
      rippleHits: 0,
      dialAngle: 0,
      constellationPath: [],
    });
  };

  const handleClose = () => {
    resetMinigame();
  };

  const handleRippleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within target area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (distance < 60) {
      setGameState(prev => ({ ...prev, rippleHits: prev.rippleHits + 1 }));
      audioManager.playSound('success');
      
      if (gameState.rippleHits >= 2) {
        setTimeout(() => {
          onComplete('minigame-ripple', gameState.rippleHits);
        }, 500);
      }
    }
  };

  const handleDialDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    setGameState(prev => ({ ...prev, dialAngle: angle }));
  };

  const handleDialMouseDown = () => {
    setIsDragging(true);
  };

  const handleDialMouseUp = () => {
    setIsDragging(false);
    // Check if dial is aligned with target
    const targetAngle = 45; // Example target
    const tolerance = 15;
    const currentAngle = gameState.dialAngle;
    
    if (Math.abs(currentAngle - targetAngle) < tolerance) {
      audioManager.playSound('success');
      setTimeout(() => {
        onComplete('minigame-dial', 1);
      }, 500);
    }
  };

  const renderRippleGame = () => (
    <div className="text-center">
      <h3 className="text-xl font-heading font-semibold text-white mb-4">
        Holo-Ripple Sync
      </h3>
      <p className="text-white/80 mb-6">
        Нажмите на центр круга когда волна коснется цели
      </p>
      
      <div
        className="relative w-64 h-64 mx-auto cursor-pointer"
        onClick={handleRippleClick}
      >
        {/* Target circle */}
        <div className="absolute inset-0 rounded-full border-2 border-glow-1 flex items-center justify-center">
          <div className="w-4 h-4 bg-glow-1 rounded-full" />
        </div>
        
        {/* Animated ripples */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-glow-2"
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 2,
              delay: i * 0.7,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
      
      <div className="mt-4 text-glow-1 font-semibold">
        Попадания: {gameState.rippleHits}/3
      </div>
    </div>
  );

  const renderDialGame = () => (
    <div className="text-center">
      <h3 className="text-xl font-heading font-semibold text-white mb-4">
        Glyph Dial
      </h3>
      <p className="text-white/80 mb-6">
        Поверните кольцо до подсвеченного сектора
      </p>
      
      <div
        className="relative w-64 h-64 mx-auto"
        onMouseDown={handleDialMouseDown}
        onMouseUp={handleDialMouseUp}
        onMouseMove={handleDialDrag}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Dial background */}
        <div className="absolute inset-0 rounded-full bg-bg-1 border-2 border-glow-1" />
        
        {/* Target sector */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: `conic-gradient(from 45deg, transparent 0deg, ${'#66F7D5'} 30deg, transparent 60deg)`,
          }}
        />
        
        {/* Rotating dial */}
        <motion.div
          className="absolute inset-8 rounded-full border-4 border-glow-2"
          style={{
            transform: `rotate(${gameState.dialAngle}deg)`,
          }}
        />
        
        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-glow-1 rounded-full" />
        </div>
      </div>
    </div>
  );

  const renderConstellationGame = () => (
    <div className="text-center">
      <h3 className="text-xl font-heading font-semibold text-white mb-4">
        Constellation Trace
      </h3>
      <p className="text-white/80 mb-6">
        Проведите линию через все звезды
      </p>
      
      <canvas
        ref={canvasRef}
        className="border border-glow-1 rounded-lg bg-bg-1"
        width={300}
        height={200}
      />
    </div>
  );

  const renderGame = () => {
    switch (minigame.type) {
      case 'ripple':
        return renderRippleGame();
      case 'dial':
        return renderDialGame();
      case 'constellation':
        return renderConstellationGame();
      default:
        return renderRippleGame();
    }
  };

  return (
    <AnimatePresence>
      {minigame.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass-strong rounded-3xl p-6 max-w-md w-full shadow-elev-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" />
                <span className="text-white font-semibold">Мини-игра</span>
              </div>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Game content */}
            {renderGame()}
            
            {/* Timer */}
            <div className="mt-6 text-center">
              <div className="text-glow-1 font-semibold">
                Время: {minigame.timeLeft}с
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MinigameModal;
