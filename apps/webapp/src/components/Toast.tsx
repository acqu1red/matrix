import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { error, setError } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setError(null), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setError(null), 300);
  };

  if (!error) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div className="glass-strong rounded-2xl p-4 shadow-elev-3 border border-red-400/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-white flex-1">{error}</p>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
