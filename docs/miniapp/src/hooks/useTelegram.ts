import { useState, useCallback } from 'react'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
          start_param?: string
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        expand: () => void
        close: () => void
        ready: () => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          onClick: (callback: () => void) => void
        }
        BackButton: {
          isVisible: boolean
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
      }
    }
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<{
    id: number
    first_name: string
    last_name?: string
    username?: string
  } | null>(null)
  const [themeParams, setThemeParams] = useState<{
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }>({})

  const initTelegram = useCallback(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Initialize WebApp
      tg.expand()
      tg.enableClosingConfirmation()
      tg.ready()
      
      // Set user data
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user)
      }
      
      // Set theme params
      setThemeParams(tg.themeParams)
      
      // Apply theme to CSS variables
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color)
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color)
      }
      
      setIsReady(true)
    }
  }, [])

  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(url, options)
    }
  }, [])

  const closeApp = useCallback(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close()
    }
  }, [])

  const showMainButton = useCallback((text: string, callback: () => void) => {
    if (window.Telegram?.WebApp) {
      const { MainButton } = window.Telegram.WebApp
      MainButton.text = text
      MainButton.show()
      MainButton.onClick(callback)
    }
  }, [])

  const hideMainButton = useCallback(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.MainButton.hide()
    }
  }, [])

  const showBackButton = useCallback((callback: () => void) => {
    if (window.Telegram?.WebApp) {
      const { BackButton } = window.Telegram.WebApp
      BackButton.show()
      BackButton.onClick(callback)
    }
  }, [])

  const hideBackButton = useCallback(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.hide()
    }
  }, [])

  return {
    isReady,
    user,
    themeParams,
    initTelegram,
    openLink,
    closeApp,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
  }
}
