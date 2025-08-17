import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { audioManager } from '@/lib/audio';
import { ArrowLeft, Volume2, VolumeX, Palette, Moon, Sun, Zap } from 'lucide-react';

const Settings = () => {
  const { config, setCurrentView, isAudioMuted, setAudioMuted } = useAppStore();

  const handleBack = () => {
    setCurrentView('map');
  };

  const handleAudioToggle = () => {
    const newMuted = !isAudioMuted;
    setAudioMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  const handleSkinChange = (skin: 'neo-solarpunk' | 'artdeco' | 'synthwave') => {
    // Update document data attribute for CSS variables
    document.documentElement.setAttribute('data-skin', skin);
    
    // In a real app, you'd save this to the backend
    localStorage.setItem('preferred-skin', skin);
  };

  const skins = [
    {
      id: 'neo-solarpunk',
      name: 'Neo-Solarpunk',
      description: 'Природа и технологии',
      icon: Sun,
      colors: ['#66F7D5', '#A6B4FF', '#FFE27A'],
    },
    {
      id: 'artdeco',
      name: 'Art-Deco Nocturne',
      description: 'Тёмное золото',
      icon: Moon,
      colors: ['#FFD700', '#B8860B', '#FF6B6B'],
    },
    {
      id: 'synthwave',
      name: 'Retro-Synthwave',
      description: '80s будущее',
      icon: Zap,
      colors: ['#FF00FF', '#00FFFF', '#FFFF00'],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-0 p-4">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={handleBack}
          className="glass rounded-2xl p-3 shadow-elev-1"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <h1 className="text-xl font-heading font-semibold text-white">
          Настройки
        </h1>
        
        <div className="w-11" />
      </motion.div>

      {/* Audio Settings */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-glass mb-6"
      >
        <h2 className="text-lg font-heading font-semibold text-white mb-4">
          Звук
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-glow-1 to-glow-2 rounded-2xl flex items-center justify-center">
              {isAudioMuted ? (
                <VolumeX className="w-6 h-6 text-bg-0" />
              ) : (
                <Volume2 className="w-6 h-6 text-bg-0" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">Звуковые эффекты</h3>
              <p className="text-white/60 text-sm">
                {isAudioMuted ? 'Выключены' : 'Включены'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAudioToggle}
            className={`w-16 h-8 rounded-full transition-all duration-300 ${
              isAudioMuted
                ? 'bg-white/20'
                : 'bg-gradient-to-r from-glow-1 to-glow-2'
            } relative`}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300"
              animate={{
                x: isAudioMuted ? 2 : 34,
              }}
            />
          </button>
        </div>
      </motion.div>

      {/* Visual Theme */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-heading font-semibold text-white mb-4">
          Визуальная тема
        </h2>
        
        {skins.map((skin, index) => (
          <motion.div
            key={skin.id}
            initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="card-glass cursor-pointer hover:shadow-elev-2 transition-all duration-300"
            onClick={() => handleSkinChange(skin.id as any)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-glow-1 to-glow-2 rounded-2xl flex items-center justify-center">
                <skin.icon className="w-8 h-8 text-bg-0" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{skin.name}</h3>
                <p className="text-white/60 text-sm mb-2">{skin.description}</p>
                
                <div className="flex space-x-2">
                  {skin.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="w-6 h-6 rounded-full border-2 border-glow-1 flex items-center justify-center">
                {config?.skin === skin.id && (
                  <div className="w-3 h-3 bg-glow-1 rounded-full" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <div className="card-glass">
          <h3 className="text-white font-semibold mb-2">Formula Private</h3>
          <p className="text-white/60 text-sm mb-4">
            Остров Архив - Интерактивная коллекция
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-white/40">
            <span>Версия 1.0.0</span>
            <span>•</span>
            <span>Telegram Mini App</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
