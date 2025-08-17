import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { telegramManager } from '@/lib/telegram';
import { apiClient } from '@/lib/api';
import { audioManager } from '@/lib/audio';

// Components
import LoadingScreen from '@/components/LoadingScreen';
import MapScene from '@/components/MapScene';
import BookPreview from '@/components/BookPreview';
import Paywall from '@/components/Paywall';
import Album from '@/components/Album';
import Settings from '@/components/Settings';
import Toast from '@/components/Toast';

function App() {
  const {
    isLoading,
    error,
    currentView,
    setLoading,
    setError,
    setUser,
    setAuthenticated,
    setConfig,
    setProgress,
    setStreak,
    setLastDailyAt,
    setAudioMuted,
  } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Telegram WebApp is available
      if (!telegramManager.isAvailable()) {
        throw new Error('Telegram WebApp is not available');
      }

      // Validate authentication
      const authResponse = await apiClient.validateAuth();
      if (!authResponse.success || !authResponse.data) {
        throw new Error(authResponse.error || 'Authentication failed');
      }

      const { user, startParam } = authResponse.data;
      setUser(user);
      setAuthenticated(true);

      // Handle referral if present
      if (startParam?.startsWith('ref_')) {
        // Referral logic will be handled by the backend
        console.log('Referral detected:', startParam);
      }

      // Load app configuration
      const configResponse = await apiClient.getConfig();
      if (!configResponse.success || !configResponse.data) {
        throw new Error(configResponse.error || 'Failed to load configuration');
      }

      setConfig(configResponse.data);

      // Load user progress
      const progressResponse = await apiClient.getProgress();
      if (progressResponse.success && progressResponse.data) {
        setProgress(progressResponse.data);
      }

      // Set user stats
      setStreak(user.streak);
      if (user.lastDailyAt) {
        setLastDailyAt(new Date(user.lastDailyAt));
      }

      // Initialize audio
      setAudioMuted(audioManager.isMuted);

      setLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Initialization failed');
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return <MapScene />;
      case 'book':
        return <BookPreview />;
      case 'paywall':
        return <Paywall />;
      case 'album':
        return <Album />;
      case 'settings':
        return <Settings />;
      default:
        return <MapScene />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
        <div className="card-glass text-center max-w-md">
          <h2 className="text-xl font-heading font-semibold text-red-400 mb-4">
            Ошибка загрузки
          </h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={initializeApp}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full"
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
      
      <Toast />
    </div>
  );
}

export default App;
