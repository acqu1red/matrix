import { useState, useCallback } from 'react'
import { useTelegram } from './useTelegram'

interface AuthResponse {
  jwt: string
  user: {
    id: string
    tgId: string
    username?: string
    isSubscribed: boolean
    subscriptionUntil?: string
    streak: number
    referralCode: string
  }
  startParam?: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const { isReady } = useTelegram()

  const validateAuth = useCallback(async () => {
    if (!isReady || typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const tg = window.Telegram?.WebApp
      if (!tg) {
        throw new Error('Telegram WebApp not available')
      }

      // Simulate user data from Telegram
      const tgUser = tg.initDataUnsafe.user
      const startParam = tg.initDataUnsafe.start_param

      if (tgUser) {
        // Generate mock user data
        const mockUser: AuthResponse['user'] = {
          id: `user_${tgUser.id}`,
          tgId: tgUser.id.toString(),
          username: tgUser.username,
          isSubscribed: false,
          streak: 0,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        }

        // Generate mock JWT
        const mockToken = btoa(JSON.stringify({
          userId: mockUser.id,
          tgId: mockUser.tgId,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        }))

        setToken(mockToken)
        setUser(mockUser)
        setIsAuthenticated(true)
        
        // Store token in localStorage for persistence
        localStorage.setItem('auth_token', mockToken)
        
        // Handle referral if present
        if (startParam?.startsWith('ref_')) {
          const referralCode = startParam.replace('ref_', '')
          console.log('Referral code:', referralCode)
        }
      }
      
    } catch (error) {
      console.error('Authentication error:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [isReady])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_token')
  }, [])

  // Check for existing token on mount
  const checkExistingToken = useCallback(async () => {
    const existingToken = localStorage.getItem('auth_token')
    if (existingToken) {
      try {
        // Validate existing token (simple base64 decode)
        const tokenData = JSON.parse(atob(existingToken))
        if (tokenData.exp > Date.now()) {
          setToken(existingToken)
          setUser({
            id: tokenData.userId,
            tgId: tokenData.tgId,
            username: 'user',
            isSubscribed: false,
            streak: 0,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          })
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('auth_token')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('auth_token')
      }
    }
    setIsLoading(false)
  }, [])

  // Initialize auth check
  useState(() => {
    checkExistingToken()
  })

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    validateAuth,
    logout,
  }
}
