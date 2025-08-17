export interface User {
  id: string;
  tgId: string;
  username?: string;
  createdAt: Date;
  referrerId?: string;
  isSubscribed: boolean;
  subscriptionUntil?: Date;
  streak: number;
  lastDailyAt?: Date;
  referralCode: string;
}

export interface Season {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  mapBgUrl: string;
  mapMidUrl: string;
  mapFgUrl: string;
  fogUrl?: string;
  skin: 'neo-solarpunk' | 'artdeco' | 'synthwave';
  hotspots: Hotspot[];
  books: Book[];
}

export interface Book {
  id: string;
  seasonId: string;
  title: string;
  coverUrl: string;
  fragmentsCount: number;
  teaserText: string;
  teaserImageUrl?: string;
  channelId: string;
  channelPostId: number;
}

export interface Hotspot {
  id: string;
  seasonId: string;
  x: number;
  y: number;
  type: 'tap' | 'hold' | 'minigame';
  minigame?: 'ripple' | 'dial' | 'constellation';
  baseReward: number;
  chanceGold?: number;
}

export interface Progress {
  id: string;
  userId: string;
  seasonId: string;
  bookId: string;
  fragments: number;
}

export interface Payment {
  id: string;
  userId: string;
  provider: 'stars' | 'invoice';
  plan: 'week' | 'month';
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: Date;
  payload?: any;
}

export interface Referral {
  id: string;
  referrerId: string;
  joinerUserId: string;
  rewardClaimed: boolean;
  createdAt: Date;
}

export interface AppConfig {
  season: Season;
  skin: 'neo-solarpunk' | 'artdeco' | 'synthwave';
  publicBaseUrl: string;
  channelId: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    start_param?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openInvoice(url: string, callback: (status: string) => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface MinigameState {
  isActive: boolean;
  type: 'ripple' | 'dial' | 'constellation';
  progress: number;
  score: number;
  timeLeft: number;
}

export interface AudioManager {
  playSound(sound: 'collect' | 'sparkle' | 'click' | 'success' | 'error'): void;
  setMuted(muted: boolean): void;
  isMuted: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}
