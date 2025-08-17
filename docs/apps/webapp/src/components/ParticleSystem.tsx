import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Particle } from '@/types';

const ParticleSystem = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 50,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#66F7D5' : '#A6B4FF',
    }));

    setParticles(initialParticles);

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          let newX = particle.x + particle.vx * deltaTime * 0.01;
          let newY = particle.y + particle.vy * deltaTime * 0.01;

          // Wrap around edges
          if (newX < -5) newX = 105;
          if (newX > 105) newX = -5;
          if (newY < -5) newY = 105;
          if (newY > 105) newY = -5;

          // Update life
          const newLife = particle.life - deltaTime * 0.05;
          
          // Reset particle if life is depleted
          if (newLife <= 0) {
            return {
              ...particle,
              x: Math.random() * 100,
              y: Math.random() * 100,
              life: particle.maxLife,
            };
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            life: newLife,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      {particles.map((particle) => {
        const opacity = particle.life / particle.maxLife;
        const scale = 0.5 + (opacity * 0.5);

        return (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity,
              transform: `scale(${scale})`,
            }}
            animate={{
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
              scale: [scale * 0.8, scale, scale * 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleSystem;
