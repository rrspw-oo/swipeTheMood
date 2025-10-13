# Frontend Types Documentation

## Overview
This document describes all TypeScript interfaces and types used throughout the QuoteSwipe application.

**Location:** `src/types/index.ts`

---

## Core Interfaces

### Quote Interface
```typescript
export interface Quote {
  id: string;
  text: string;
  author?: string;
  moods: string[];
  createdAt: Date;
}
```

**Description:** Represents a single quote/wisdom saying in the application.

**Properties:**
- `id` - Unique identifier for the quote (required)
- `text` - The actual quote content (required)
- `author` - Author name, optional for anonymous quotes
- `moods` - Array of mood categories this quote belongs to
- `createdAt` - Timestamp of when quote was created

**Usage Example:**
```typescript
const quote: Quote = {
  id: '1',
  text: 'Stay hungry, stay foolish.',
  author: 'Steve Jobs',
  moods: ['innovation', 'excited'],
  createdAt: new Date('2024-01-03'),
};
```

---

## Type Unions

### MoodType
```typescript
export type MoodType = 'excited' | 'innovation' | 'not-my-day' | 'reflection';
```

**Description:** Defines the available mood categories for quote filtering.

**Values:**
- `'excited'` - For quotes about staying humble when things go well
- `'innovation'` - For quotes about zero-to-one thinking and creativity
- `'not-my-day'` - For quotes to help push through difficult times
- `'reflection'` - For deep thoughts and wisdom quotes

**Usage in Components:**
```typescript
// MoodSelector component
const handleMoodSelect = (mood: MoodType | null) => {
  // Filter quotes by mood
};

// API service
export const getQuotesByMood = async (mood: MoodType): Promise<Quote[]> => {
  // Return filtered quotes
};
```

### TabType
```typescript
export type TabType = 'random' | 'mood';
```

**Description:** Defines the two main navigation modes in the application.

**Values:**
- `'random'` - Random browsing of all quotes
- `'mood'` - Mood-filtered browsing experience

**Usage in Components:**
```typescript
// SwipeInterface state
const [activeTab, setActiveTab] = useState<TabType>('random');

// TabNavigation props
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
```

---

## Utility Types

### SwipeDirection Interface
```typescript
export interface SwipeDirection {
  direction: 'left' | 'right';
  distance: number;
}
```

**Description:** Represents swipe gesture information (currently defined but not actively used).

**Properties:**
- `direction` - Direction of swipe gesture
- `distance` - Distance of swipe in pixels

---

## Component Props Interfaces

While not defined in the types file, components use these interface patterns:

### QuoteCardProps
```typescript
interface QuoteCardProps {
  quote: Quote;
  className?: string;
}
```

### MoodSelectorProps
```typescript
interface MoodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: MoodType | null) => void;
  currentMood: MoodType | null;
}
```

### TabNavigationProps
```typescript
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
```

---

## Type Guards and Utilities

### Mood Type Checking
```typescript
// Type guard for MoodType
const isMoodType = (value: string): value is MoodType => {
  return ['excited', 'innovation', 'not-my-day', 'reflection'].includes(value);
};
```

### Quote Validation
```typescript
// Validate quote structure
const isValidQuote = (obj: any): obj is Quote => {
  return (
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    Array.isArray(obj.moods) &&
    obj.createdAt instanceof Date
  );
};
```

---

## Future Type Extensions

### Planned Additions
```typescript
// User management (future)
export interface User {
  id: string;
  name: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoriteQuotes: string[]; // Quote IDs
  preferredMoods: MoodType[];
  theme: 'light' | 'dark';
}

// Analytics (future)
export interface QuoteInteraction {
  quoteId: string;
  action: 'view' | 'swipe-left' | 'swipe-right';
  timestamp: Date;
}
```

---

## Import/Export Usage

### Common Import Pattern
```typescript
// In component files
import { Quote, MoodType, TabType } from '../types';

// In service files
import type { Quote, MoodType } from '../types';
```

### Re-export Strategy
The `types/index.ts` file serves as the single source of truth for all type definitions, allowing clean imports throughout the application.

---

## TypeScript Configuration Notes

### Strict Mode
The application uses TypeScript in strict mode:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

### Import Resolution
```json
{
  "moduleResolution": "bundler",
  "allowImportingTsExtensions": true,
  "resolveJsonModule": true
}
```

This ensures clean import paths and proper type checking throughout the application.