import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Hotspot {
  id: string
  x: number
  y: number
  type: 'tap' | 'hold' | 'minigame'
  minigame?: 'ripple' | 'dial' | 'constellation'
  baseReward: number
  chanceGold?: number
  cooldown?: number
}

export interface Book {
  id: string
  title: string
  coverUrl: string
  fragmentsCount: number
  teaser: {
    text: string
    imageUrl?: string
  }
  channelId: string
  channelPostId: number
}

export interface Season {
  id: string
  title: string
  startsAt: string
  endsAt: string
  mapAssets: {
    bg: string
    mid: string
    fg: string
    fog?: string
  }
  skin: 'neo-solarpunk' | 'artdeco' | 'synthwave'
  hotspots: Hotspot[]
}

export interface Progress {
  id: string
  seasonId: string
  bookId: string
  fragments: number
}

export interface GameState {
  // Core state
  isGameReady: boolean
  currentSeason: Season | null
  currentBook: Book | null
  books: Book[]
  progress: Progress[]
  
  // Player state
  totalFragments: number
  streak: number
  lastDailyAt: string | null
  isSubscribed: boolean
  
  // UI state
  activeHotspot: Hotspot | null
  showPaywall: boolean
  showCollection: boolean
  showSettings: boolean
  
  // Minigame state
  activeMinigame: {
    type: 'ripple' | 'dial' | 'constellation'
    hotspot: Hotspot
    progress: number
    completed: boolean
  } | null
  
  // Actions
  initGame: () => Promise<void>
  collectFragment: (hotspotId: string) => Promise<void>
  openHotspot: (hotspot: Hotspot) => void
  closeHotspot: () => void
  startMinigame: (hotspot: Hotspot) => void
  completeMinigame: (success: boolean) => void
  claimDailyReward: () => Promise<void>
  openPaywall: () => void
  closePaywall: () => void
  openCollection: () => void
  closeCollection: () => void
  openSettings: () => void
  closeSettings: () => void
  setSkin: (skin: Season['skin']) => void
  checkSubscription: () => Promise<void>
}

// Demo data
const getDemoSeason = (): Season => ({
  id: 'demo-season',
  title: 'Остров Архив',
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  mapAssets: {
    bg: './assets/skins/neo-solarpunk/bg.webp',
    mid: './assets/skins/neo-solarpunk/mid.webp',
    fg: './assets/skins/neo-solarpunk/fg.webp',
    fog: './assets/skins/neo-solarpunk/fog.webp',
  },
  skin: 'neo-solarpunk',
  hotspots: [
    { id: '1', x: 20, y: 30, type: 'tap', baseReward: 2 },
    { id: '2', x: 60, y: 40, type: 'hold', baseReward: 3 },
    { id: '3', x: 80, y: 20, type: 'minigame', minigame: 'ripple', baseReward: 4 },
    { id: '4', x: 40, y: 70, type: 'tap', baseReward: 2 },
    { id: '5', x: 70, y: 80, type: 'minigame', minigame: 'dial', baseReward: 4 },
    { id: '6', x: 30, y: 50, type: 'tap', baseReward: 2 },
    { id: '7', x: 50, y: 25, type: 'hold', baseReward: 3 },
    { id: '8', x: 90, y: 60, type: 'minigame', minigame: 'constellation', baseReward: 4 },
    { id: '9', x: 15, y: 80, type: 'tap', baseReward: 2 },
    { id: '10', x: 75, y: 35, type: 'hold', baseReward: 3 },
  ]
})

const getDemoBook = (): Book => ({
  id: 'demo-book',
  title: 'Формула Успеха',
  coverUrl: './assets/covers/book1.webp',
  fragmentsCount: 7,
  teaser: {
    text: 'Откройте секреты успешных людей и узнайте, как применить их опыт в своей жизни. Эта книга раскроет перед вами принципы, которые используют миллионеры и лидеры мирового уровня.',
    imageUrl: './assets/teasers/book1.webp',
  },
  channelId: '-1001234567890',
  channelPostId: 1,
})

const getDemoBook2 = (): Book => ({
  id: 'demo-book-2',
  title: 'Искусство Переговоров',
  coverUrl: './assets/covers/book2.webp',
  fragmentsCount: 5,
  teaser: {
    text: 'Научитесь вести эффективные переговоры и добиваться желаемых результатов. Практические техники и стратегии для любых ситуаций.',
    imageUrl: './assets/teasers/book2.webp',
  },
  channelId: '-1001234567890',
  channelPostId: 2,
})

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isGameReady: false,
      currentSeason: null,
      currentBook: null,
      books: [],
      progress: [],
      totalFragments: 0,
      streak: 0,
      lastDailyAt: null,
      isSubscribed: false,
      activeHotspot: null,
      showPaywall: false,
      showCollection: false,
      showSettings: false,
      activeMinigame: null,

      // Actions
      initGame: async () => {
        // Load from localStorage if available
        const savedProgress = localStorage.getItem('gameProgress')
        const savedStreak = localStorage.getItem('gameStreak')
        const savedLastDaily = localStorage.getItem('lastDailyAt')
        
        set({
          currentSeason: getDemoSeason(),
          currentBook: getDemoBook(),
          books: [getDemoBook(), getDemoBook2()],
          progress: savedProgress ? JSON.parse(savedProgress) : [],
          totalFragments: savedProgress ? JSON.parse(savedProgress).reduce((sum: number, p: any) => sum + p.fragments, 0) : 0,
          streak: savedStreak ? parseInt(savedStreak) : 0,
          lastDailyAt: savedLastDaily,
          isSubscribed: false,
          isGameReady: true,
        })
      },

      collectFragment: async (hotspotId: string) => {
        const { currentSeason, currentBook, progress } = get()
        if (!currentSeason || !currentBook) return

        const hotspot = currentSeason.hotspots.find(h => h.id === hotspotId)
        if (!hotspot) return

        // Calculate reward
        let fragments = hotspot.baseReward
        if (hotspot.chanceGold && Math.random() < hotspot.chanceGold) {
          fragments += Math.floor(fragments * 0.5)
        }

        // Update progress
        const existingProgress = progress.find(p => p.bookId === currentBook.id)
        const newProgress = existingProgress 
          ? progress.map(p => p.bookId === currentBook.id 
              ? { ...p, fragments: p.fragments + fragments }
              : p)
          : [...progress, {
              id: Date.now().toString(),
              seasonId: currentSeason.id,
              bookId: currentBook.id,
              fragments
            }]

        const newTotalFragments = get().totalFragments + fragments

        set((state) => ({
          totalFragments: newTotalFragments,
          progress: newProgress,
        }))

        // Save to localStorage
        localStorage.setItem('gameProgress', JSON.stringify(newProgress))
      },

      openHotspot: (hotspot: Hotspot) => {
        set({ activeHotspot: hotspot })
      },

      closeHotspot: () => {
        set({ activeHotspot: null, activeMinigame: null })
      },

      startMinigame: (hotspot: Hotspot) => {
        if (hotspot.type === 'minigame' && hotspot.minigame) {
          set({
            activeMinigame: {
              type: hotspot.minigame,
              hotspot,
              progress: 0,
              completed: false,
            }
          })
        }
      },

      completeMinigame: (success: boolean) => {
        const { activeMinigame } = get()
        if (activeMinigame && success) {
          get().collectFragment(activeMinigame.hotspot.id)
        }
        set({ activeMinigame: null, activeHotspot: null })
      },

      claimDailyReward: async () => {
        const { lastDailyAt, streak } = get()
        const now = new Date()
        
        // Check if can claim
        if (lastDailyAt) {
          const lastClaim = new Date(lastDailyAt)
          const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
          if (diffHours < 24) {
            return // Already claimed
          }
        }

        // Calculate reward
        const baseReward = 5
        const streakBonus = Math.floor(streak * 0.5)
        const totalReward = baseReward + streakBonus

        // Update streak
        const newStreak = lastDailyAt ? 
          (now.getTime() - new Date(lastDailyAt).getTime() < 48 * 60 * 60 * 1000 ? streak + 1 : 1) 
          : 1

        // Add to current book progress
        const { currentBook, progress } = get()
        if (currentBook) {
          const existingProgress = progress.find(p => p.bookId === currentBook.id)
          const newProgress = existingProgress 
            ? progress.map(p => p.bookId === currentBook.id 
                ? { ...p, fragments: p.fragments + totalReward }
                : p)
            : [...progress, {
                id: Date.now().toString(),
                seasonId: get().currentSeason?.id || '',
                bookId: currentBook.id,
                fragments: totalReward
              }]

          set((state) => ({
            totalFragments: state.totalFragments + totalReward,
            progress: newProgress,
            streak: newStreak,
            lastDailyAt: now.toISOString(),
          }))

          // Save to localStorage
          localStorage.setItem('gameProgress', JSON.stringify(newProgress))
          localStorage.setItem('gameStreak', newStreak.toString())
          localStorage.setItem('lastDailyAt', now.toISOString())
        }
      },

      openPaywall: () => set({ showPaywall: true }),
      closePaywall: () => set({ showPaywall: false }),
      openCollection: () => set({ showCollection: true }),
      closeCollection: () => set({ showCollection: false }),
      openSettings: () => set({ showSettings: true }),
      closeSettings: () => set({ showSettings: false }),

      setSkin: (skin: Season['skin']) => {
        set((state) => ({
          currentSeason: state.currentSeason 
            ? { ...state.currentSeason, skin }
            : null
        }))
      },

      checkSubscription: async () => {
        // Simulate subscription check
        set({ isSubscribed: false })
      },
    }),
    {
      name: 'game-store',
    }
  )
)
