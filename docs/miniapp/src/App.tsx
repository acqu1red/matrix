import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useTelegram } from './hooks/useTelegram'
import { useAuth } from './hooks/useAuth'
import { useGameStore } from './store/gameStore'
import MapScene from './components/MapScene'
import Paywall from './components/Paywall'
import Collection from './components/Collection'
import Settings from './components/Settings'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'

function App() {
  const { initTelegram, isReady } = useTelegram()
  const { validateAuth, isAuthenticated, isLoading } = useAuth()
  const { initGame, isGameReady } = useGameStore()

  useEffect(() => {
    initTelegram()
  }, [initTelegram])

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      validateAuth()
    }
  }, [isReady, isAuthenticated, validateAuth])

  useEffect(() => {
    if (isAuthenticated && !isGameReady) {
      initGame()
    }
  }, [isAuthenticated, isGameReady, initGame])

  if (isLoading || !isReady || !isAuthenticated || !isGameReady) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-bg-0 text-white overflow-hidden">
      <Routes>
        <Route path="/" element={<MapScene />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toast />
    </div>
  )
}

export default App
