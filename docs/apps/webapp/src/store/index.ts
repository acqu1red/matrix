import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, Season, Progress, MinigameState, AppConfig } from '@/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // App config
  config: AppConfig | null;
  
  // Progress and rewards
  progress: Progress[];
  totalFragments: number;
  streak: number;
  lastDailyAt: Date | null;
  
  // UI state
  currentView: 'map' | 'book' | 'paywall' | 'album' | 'settings';
  isLoading: boolean;
  error: string | null;
  
  // Minigame state
  minigame: MinigameState;
  
  // Audio state
  isAudioMuted: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setConfig: (config: AppConfig) => void;
  setProgress: (progress: Progress[]) => void;
  addFragments: (amount: number) => void;
  setStreak: (streak: number) => void;
  setLastDailyAt: (date: Date) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMinigameState: (state: Partial<MinigameState>) => void;
  setAudioMuted: (muted: boolean) => void;
  resetMinigame: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  config: null,
  progress: [],
  totalFragments: 0,
  streak: 0,
  lastDailyAt: null,
  currentView: 'map' as const,
  isLoading: true,
  error: null,
  minigame: {
    isActive: false,
    type: 'ripple',
    progress: 0,
    score: 0,
    timeLeft: 20,
  },
  isAudioMuted: false,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setConfig: (config) => set({ config }),
      setProgress: (progress) => {
        const totalFragments = progress.reduce((sum, p) => sum + p.fragments, 0);
        set({ progress, totalFragments });
      },
      addFragments: (amount) => {
        const { totalFragments } = get();
        set({ totalFragments: totalFragments + amount });
      },
      setStreak: (streak) => set({ streak }),
      setLastDailyAt: (date) => set({ lastDailyAt: date }),
      setCurrentView: (currentView) => set({ currentView }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setMinigameState: (state) => {
        const { minigame } = get();
        set({ minigame: { ...minigame, ...state } });
      },
      setAudioMuted: (isAudioMuted) => set({ isAudioMuted }),
      resetMinigame: () => set({
        minigame: {
          isActive: false,
          type: 'ripple',
          progress: 0,
          score: 0,
          timeLeft: 20,
        }
      }),
    }),
    {
      name: 'formula-private-store',
    }
  )
);
