# Frontend Components Documentation

## Overview
This document describes all React components in the QuoteSwipe application, organized by functionality and location. The new folder structure groups components by features and pages for better maintainability.

---

## Folder Structure

```
src/
├── app/                                    # Application entry point
│   ├── App.tsx
│   └── main.tsx
│
├── pages/                                  # Page-level components
│   └── SwipeInterface/                    # Main swipe page
│       ├── index.tsx
│       └── components/                    # Page-specific components
│           ├── QuoteCard/
│           │   └── index.tsx
│           └── EmptyCard/
│               └── index.tsx
│
├── features/                               # Feature modules
│   ├── mood/                              # Mood selection feature
│   │   ├── MoodGrid/
│   │   │   └── index.tsx
│   │   └── MoodSelector/
│   │       └── index.tsx
│   │
│   ├── user/                              # User-related features
│   │   ├── UserProfile/
│   │   │   └── index.tsx
│   │   ├── UserCardsModal/
│   │   │   └── index.tsx
│   │   ├── AddQuoteModal/
│   │   │   └── index.tsx
│   │   └── LoginModal/
│   │       └── index.tsx
│   │
│   └── theme/                             # Theme management
│       └── ThemeToggle/
│           └── index.tsx
│
└── components/                             # Shared UI components
    ├── TabNavigation/
    │   └── index.tsx
    ├── ViewModeToggle/
    │   └── index.tsx
    └── HexagonIcon/
        └── index.tsx
```

---

## Page Components

### SwipeInterface (Main Page)

**Location:** `src/pages/SwipeInterface/index.tsx`

**Purpose:** Main application interface handling quote display, swiping, and navigation between different modes (Random/Mood/Vitality/Paradigm).

#### State Management
```typescript
const [quotes, setQuotes] = useState<Quote[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [history, setHistory] = useState<number[]>([]);
const [activeTab, setActiveTab] = useState<TabType>('random');
const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
const [viewMode, setViewMode] = useState<ViewMode>('default');
const [randomQuotesCache, setRandomQuotesCache] = useState<Quote[]>([]);
```

#### Key Functions

**`handleDragEnd(event, info: PanInfo)`**
- Handles swipe gestures with 80px threshold
- Animates card exit (slides off screen completely)
- Updates quote content
- Shows new card with fade-in effect

**`handleTabChange(tab: TabType)`**
- Switches between Random, Mood, Vitality, and Paradigm tabs
- Uses cached quotes for performance optimization
- Resets history when switching tabs

**`handleMoodSelect(mood: MoodType)`**
- Filters quotes by selected mood
- Shuffles mood quotes for random order
- Updates filter state

**`handleViewModeToggle()`**
- Toggles between default and alternative view modes
- Switches tab navigation (Random/Mood vs Vitality/Paradigm)
- Manages quote cache

#### Animation Behavior
- **Swipe Out:** Card slides completely off screen with fade
- **New Card:** Appears in center with fade-in only
- **Spring Back:** Smooth spring animation when swipe threshold not met

#### Import Dependencies
```typescript
import QuoteCard from './components/QuoteCard';
import EmptyCard from './components/EmptyCard';
import MoodGrid from '../../features/mood/MoodGrid';
import TabNavigation from '../../components/TabNavigation';
import ThemeToggle from '../../features/theme/ThemeToggle';
import ViewModeToggle from '../../components/ViewModeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { getInitialQuotes, getQuotesByMood, ... } from '../../services/firebase/api';
```

---

## Page-Specific Components

### QuoteCard

**Location:** `src/pages/SwipeInterface/components/QuoteCard/index.tsx`

**Purpose:** Displays a single quote in a card format with author information, mood tags, and edit/delete actions.

#### Props Interface
```typescript
interface QuoteCardProps {
  quote: Quote;
  className?: string;
  onAuthorClick?: (author: string) => void;
  onMoodClick?: (mood: MoodType) => void;
  onEditClick?: (quote: Quote) => void;
  onDeleteClick?: (quoteId: string) => void;
  canEdit?: boolean;
  filterInfo?: {
    type: 'author' | 'mood';
    value: string;
    count: number;
    onClear: () => void;
  };
}
```

#### Features
- Displays quote text with quotation marks
- Shows author name (clickable to filter by author)
- Displays mood tags as colored badges (clickable to filter by mood)
- Edit/delete actions for authorized users
- Filter info badge showing current filter and count
- Responsive design optimized for mobile

#### Styling
- Uses theme-based colors (`bg-theme-cardBg`, `border-theme-cardBorder`)
- Rounded corners with `rounded-2xl`
- Shadow and border for depth
- Gradient decorative line at bottom
- Pink-themed mood tags using `primary-500`

### EmptyCard

**Location:** `src/pages/SwipeInterface/components/EmptyCard/index.tsx`

**Purpose:** Placeholder card displayed when no quotes are available or in Vitality/Paradigm modes.

#### Props Interface
```typescript
interface EmptyCardProps {
  className?: string;
  variant?: 'default' | 'alternative';
}
```

#### Features
- Two variants: default (pink) and alternative (purple)
- Displays "Coming Soon" message
- Maintains consistent card design with QuoteCard

---

## Feature Components

### Mood Feature

#### MoodGrid

**Location:** `src/features/mood/MoodGrid/index.tsx`

**Purpose:** Grid layout displaying all available mood options for quick selection.

**Props Interface:**
```typescript
interface MoodGridProps {
  onSelectMood: (mood: MoodType) => void;
}
```

**Features:**
- 2x2 grid layout for all mood options
- Each mood has gradient background
- Displays mood name and icon
- Tap animation for selection

#### MoodSelector

**Location:** `src/features/mood/MoodSelector/index.tsx`

**Purpose:** Modal interface for selecting mood categories to filter quotes.

**Props Interface:**
```typescript
interface MoodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: MoodType | null) => void;
  currentMood: MoodType | null;
}
```

**Mood Options:**
```typescript
const moods = [
  {
    label: 'excited',
    displayName: 'Excited',
    description: 'Stay humble and grounded',
    color: 'from-yellow-400 to-orange-400'
  },
  {
    label: 'innovation',
    displayName: 'Innovation',
    description: 'Zero to one mindset',
    color: 'from-blue-400 to-purple-400'
  },
  {
    label: 'not-my-day',
    displayName: 'Not My Day',
    description: 'Push through the tough times',
    color: 'from-gray-400 to-slate-400'
  },
  {
    label: 'reflection',
    displayName: 'Reflection',
    description: 'Deep thoughts and wisdom',
    color: 'from-pink-400 to-rose-400'
  }
];
```

**Features:**
- Bottom sheet modal with backdrop
- Each mood has gradient icon with first letter
- Visual selection indicator (checkmark)
- "Show All" and "Done" actions
- Slide-up animation with spring physics

---

### User Feature

#### UserProfile

**Location:** `src/features/user/UserProfile/index.tsx`

**Purpose:** Displays user avatar, manages user authentication, and provides access to user cards.

**Props Interface:**
```typescript
interface UserProfileProps {
  onSignInClick: () => void;
  viewMode?: ViewMode;
}
```

**Features:**
- Shows user avatar or sign-in button
- Opens UserCardsModal
- Sign out functionality
- Clear user data option
- Dropdown menu for user actions

#### UserCardsModal

**Location:** `src/features/user/UserCardsModal/index.tsx`

**Purpose:** Modal displaying all quotes created by the current user with edit/delete capabilities.

**Props Interface:**
```typescript
interface UserCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Lists all user-created quotes
- Edit and delete actions for each quote
- Integration with AddQuoteModal for editing
- Loading states

#### AddQuoteModal

**Location:** `src/features/user/AddQuoteModal/index.tsx`

**Purpose:** Modal interface for users to create and add new quotes or edit existing ones. Supports dual mode system (Quote/Vitality) with intelligent tag suggestions and usage tracking.

**Props Interface:**
```typescript
interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteData: CreateQuoteData) => Promise<void>;
  editingQuote?: Quote;
  mode?: 'quote' | 'vitality';
}

interface CreateQuoteData {
  text: string;
  author: string;
  moods: MoodType[] | string[];
  isPublic?: boolean;
  type?: 'quote' | 'vitality';
}
```

**Features:**

**Quote Mode:**
- Quote text input with 500 character limit
- Author input with 100 character limit and autocomplete
- Fixed mood tags (Excited, Innovation, Not My Day, Reflection)
- Custom tags input with suggestions and quick select
- Privacy toggle (public/private)
- Form validation with error messages
- Edit mode support
- Loading states

**Vitality Mode:**
- Vitality content input with 500 character limit
- Author input with autocomplete
- Free-form tags system with suggestions and quick select
- Privacy toggle (public/private)

**Author Autocomplete System:**
- Real-time suggestions dropdown (max 7 suggestions)
- Quick select tags below input (responsive: 5 mobile / 7 tablet / 11 desktop)
- Authors sorted by recent usage (localStorage tracking)
- Click suggestion to auto-fill author field
- Tracks usage when author is selected or quote is saved

**Tags Autocomplete System:**
- Real-time suggestions dropdown (max 7 suggestions)
- Quick select tags below input (responsive: 5 mobile / 7 tablet / 11 desktop)
- Tags sorted by recent usage (localStorage tracking)
- Excludes already selected tags from suggestions
- Filters out fixed mood tags from custom tags list
- Click suggestion to add tag instantly
- Tracks usage when tag is selected or quote is saved
- Press Enter to add new custom tags

**Usage Tracking:**
- Tracks author selection and usage frequency
- Tracks tag selection and usage frequency
- Stores in localStorage for personalized experience
- Sorts suggestions by most recent usage first
- Within 24 hours, sorts by usage count
- Maximum 100 records tracked per category

**Form Validation Rules:**
- Quote/Vitality content cannot be empty
- Content limited to 500 characters
- Author name limited to 100 characters
- At least one tag must be selected (fixed mood tag or custom tag for Quote mode, any custom tag for Vitality mode)

#### LoginModal

**Location:** `src/features/user/LoginModal/index.tsx`

**Purpose:** Modal for user authentication via Google Sign-In.

**Props Interface:**
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Google Sign-In button
- Error handling and display
- Loading state during authentication
- Automatic close on successful login

---

### Theme Feature

#### ThemeToggle

**Location:** `src/features/theme/ThemeToggle/index.tsx`

**Purpose:** Button to toggle between light and dark themes.

**Props Interface:**
```typescript
interface ThemeToggleProps {
  viewMode?: ViewMode;
}
```

**Features:**
- Sun/moon icon based on current theme
- Different colors for default and alternative view modes
- Smooth transition animation
- Integrates with ThemeContext

---

## Shared UI Components

### TabNavigation

**Location:** `src/components/TabNavigation/index.tsx`

**Purpose:** Dynamic tab navigation system that adapts to different view modes.

**Props Interface:**
```typescript
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  viewMode?: ViewMode;
}
```

**Features:**
- Default mode: Random / Mood tabs
- Alternative mode: Vitality / Paradigm tabs
- Animated sliding indicator
- Spring animation for smooth transitions
- Color adaptation based on view mode

**Animation Details:**
- Uses `motion.div` for sliding indicator
- Spring physics: `stiffness: 300, damping: 30`
- Indicator width: 50% of container
- Smooth X-axis translation based on active tab

### ViewModeToggle

**Location:** `src/components/ViewModeToggle/index.tsx`

**Purpose:** Toggle button to switch between default and alternative view modes.

**Props Interface:**
```typescript
interface ViewModeToggleProps {
  currentMode: ViewMode;
  onToggle: () => void;
}
```

**Features:**
- Hexagon icon button
- Color changes based on current mode
- Smooth transition animation
- Positioned in header

### HexagonIcon

**Location:** `src/components/HexagonIcon/index.tsx`

**Purpose:** SVG hexagon icon used in ViewModeToggle.

**Props Interface:**
```typescript
interface HexagonIconProps {
  className?: string;
  filled?: boolean;
}
```

**Features:**
- Scalable SVG
- Filled or outlined variant
- Inherits color from parent

---

## Component Dependencies

```
App.tsx
└── SwipeInterface/
    ├── components/
    │   ├── QuoteCard
    │   └── EmptyCard
    ├── features/mood/
    │   ├── MoodGrid
    │   └── MoodSelector
    ├── features/user/
    │   ├── UserProfile
    │   │   └── UserCardsModal
    │   │       └── AddQuoteModal
    │   ├── AddQuoteModal
    │   └── LoginModal
    ├── features/theme/
    │   └── ThemeToggle
    └── components/
        ├── TabNavigation
        ├── ViewModeToggle
        └── HexagonIcon
```

## Shared Dependencies
- `framer-motion` for all animations
- `../../types` for TypeScript interfaces
- `../../services/firebase/api` for data fetching
- `../../contexts/AuthContext` for authentication
- `../../contexts/ThemeContext` for theme management
- Tailwind CSS for styling with custom color system

---

## Import Path Conventions

**From page components (SwipeInterface):**
- Types: `../../types`
- Services: `../../services/firebase/api`
- Contexts: `../../contexts/[ContextName]`
- Features: `../../features/[feature]/[Component]`
- Shared components: `../../components/[Component]`
- Page components: `./components/[Component]`

**From feature components:**
- Types: `../../../types`
- Services: `../../../services/firebase/api`
- Contexts: `../../../contexts/[ContextName]`
- Other features: `../../[feature]/[Component]`

**From shared components:**
- Types: `../../types`
- Other shared: `../[Component]`

---

## Notes on File Organization

1. **Page Components** (`pages/SwipeInterface/components/`): Only used by SwipeInterface page
2. **Feature Components** (`features/`): Grouped by functionality (mood, user, theme)
3. **Shared Components** (`components/`): Reusable across different pages
4. **Index Files**: Each component folder has `index.tsx` for cleaner imports
5. **Future CSS**: Component-specific styles can be added alongside component files
