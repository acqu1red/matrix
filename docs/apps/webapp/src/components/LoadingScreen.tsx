import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-1 via-bg-0 to-bg-1" />
      
      {/* Animated particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-glow-1 rounded-full opacity-60"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Main content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 relative">
            {/* Island icon */}
            <div className="absolute inset-0 bg-gradient-to-b from-glow-1 to-glow-2 rounded-3xl shadow-glow-1" />
            <div className="absolute inset-2 bg-bg-0 rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-b from-glow-1 to-glow-2 rounded-lg" />
            </div>
          </div>
          
          <h1 className="text-2xl font-heading font-semibold text-white mb-2">
            Formula Private
          </h1>
          <p className="text-glow-1 font-medium">Остров Архив</p>
        </motion.div>
        
        {/* Loading dots */}
        <motion.div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-glow-1 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/60 text-sm mt-6"
        >
          Загружаем остров...
        </motion.p>
      </div>
      
      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 border border-glow-1/20 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-12 h-12 border border-glow-2/20 rounded-full"
        animate={{
          rotate: -360,
          scale: [1, 0.9, 1],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
};

export default LoadingScreen;
