import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotspot } from '@/types';
import { Sparkles, Clock, Gamepad2 } from 'lucide-react';

interface HotspotButtonProps {
  hotspot: Hotspot;
  onClick: () => void;
}

const HotspotButton = ({ hotspot, onClick }: HotspotButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    if (hotspot.type === 'hold') {
      setIsPressed(true);
      setHoldProgress(0);
      
      // Start hold progress
      const startTime = Date.now();
      const duration = 800; // 800ms hold time
      
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setHoldProgress(progress);
        
        if (progress >= 1) {
          clearInterval(progressTimerRef.current!);
          handleComplete();
        }
      }, 16);
    }
  };

  const handleMouseUp = () => {
    if (hotspot.type === 'hold') {
      setIsPressed(false);
      setHoldProgress(0);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowRipple(true);
    onClick();
    
    setTimeout(() => {
      setShowRipple(false);
    }, 800);
  };

  const getIcon = () => {
    switch (hotspot.type) {
      case 'tap':
        return <Sparkles className="w-4 h-4" />;
      case 'hold':
        return <Clock className="w-4 h-4" />;
      case 'minigame':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getGlowColor = () => {
    if (hotspot.chanceGold && Math.random() < hotspot.chanceGold) {
      return 'from-accent to-glow-1';
    }
    return 'from-glow-1 to-glow-2';
  };

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.button
        className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getGlowColor()} 
                   border-2 border-white/20 cursor-pointer shadow-glow-1
                   hover:shadow-glow-2 transition-all duration-300`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (hotspot.type === 'hold') {
            setIsPressed(false);
            setHoldProgress(0);
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current);
            }
          }
        }}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* Hold progress ring */}
        {hotspot.type === 'hold' && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
              fill="none"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(102, 247, 213, 0.8)"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={2 * Math.PI * 28 * (1 - holdProgress)}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {getIcon()}
        </div>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-glow-1 to-glow-2 opacity-0"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Ripple effect */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-glow-1 to-glow-2"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Reward indicator */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-glow-1 font-semibold"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -20, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              +{hotspot.baseReward}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Minigame indicator */}
      {hotspot.type === 'minigame' && (
        <motion.div
          className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-bg-0 text-xs font-bold">!</span>
        </motion.div>
      )}
    </div>
  );
};

export default HotspotButton;
