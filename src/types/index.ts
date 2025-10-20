export interface Foundation {
  id: string;
  code: string;
  title: string;
  description: string;
  examples: string[];
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  moods: string[];
  createdAt: Date;
  userId?: string;
  isPublic?: boolean;
  type?: 'quote' | 'vitality' | 'paradigm';
  theory?: string;
  foundations?: Foundation[];
}

export interface CreateQuoteData {
  text: string;
  author: string;
  moods: MoodType[] | string[];
  isPublic?: boolean;
  type?: 'quote' | 'vitality';
}

export interface CreateParadigmData {
  theory: string;
  description?: string;
  moods: string[];
  foundations: Foundation[];
  isPublic?: boolean;
  type: 'paradigm';
}

export type MoodType = 'excited' | 'innovation' | 'not-my-day' | 'reflection';

export type TabType = 'random' | 'mood' | 'author' | 'vitality' | 'paradigm';

export type ViewMode = 'default' | 'alternative';

export interface FilterState {
  type: TabType;
  value: string | MoodType | null;
}

export interface SwipeDirection {
  direction: 'left' | 'right';
  distance: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}