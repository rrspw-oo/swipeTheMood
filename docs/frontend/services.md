# Frontend Services Documentation

## Overview
This document describes the service layer that handles data fetching, authentication, and Firebase communication in the QuoteSwipe application.

---

## Folder Structure

```
src/services/
└── firebase/
    ├── config.ts         # Firebase configuration and initialization
    ├── auth.ts          # Authentication services
    ├── firestore.ts     # Firestore database operations
    └── api.ts           # High-level API functions (combines mock + Firestore)
```

---

## Firebase Configuration

**Location:** `src/services/firebase/config.ts`

**Purpose:** Initializes Firebase app, authentication, and Firestore database.

### Exports
```typescript
export const app: FirebaseApp;
export const auth: Auth;
export const db: Firestore;
```

### Configuration
- Reads Firebase config from environment variables
- Initializes Firebase app
- Sets up Auth and Firestore instances
- Used by all other Firebase services

---

## Authentication Service

**Location:** `src/services/firebase/auth.ts`

**Purpose:** Handles user authentication via Google Sign-In and user profile management.

### Exports

#### UserProfile Interface
```typescript
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  quotesCreated: number;
}
```

#### Functions

**signInWithGoogle()**
```typescript
export const signInWithGoogle = async (): Promise<UserProfile | null>
```
- Opens Google Sign-In popup
- Creates or updates user profile in Firestore
- Returns UserProfile on success
- Throws error on failure

**signOutUser()**
```typescript
export const signOutUser = async (): Promise<void>
```
- Signs out current user
- Clears authentication state

**onAuthStateChange()**
```typescript
export const onAuthStateChange = (
  callback: (user: User | null) => void
): Unsubscribe
```
- Listens to authentication state changes
- Calls callback with current user or null
- Returns unsubscribe function

**createOrUpdateUserProfile()**
```typescript
export const createOrUpdateUserProfile = async (
  user: User
): Promise<UserProfile>
```
- Creates new user profile or updates last login time
- Stores user data in Firestore `users` collection
- Returns UserProfile object

---

## Firestore Service

**Location:** `src/services/firebase/firestore.ts`

**Purpose:** Direct Firestore database operations for quotes management.

### Quote Collection Operations

#### getUserQuotes()
```typescript
export const getUserQuotes = async (userId: string): Promise<Quote[]>
```
- Fetches all quotes created by specific user
- Ordered by creation date (newest first)
- Returns array of Quote objects

#### getInitialQuotes()
```typescript
export const getInitialQuotes = async (
  userId?: string,
  includePublic: boolean = true
): Promise<Quote[]>
```
- Fetches quotes for browsing
- If user logged in: user's quotes + public quotes
- If not logged in: public quotes only
- Ordered by creation date

#### getQuotesByMood()
```typescript
export const getQuotesByMood = async (
  mood: MoodType,
  userId?: string
): Promise<Quote[]>
```
- Filters quotes by mood tag
- Includes user's quotes + public quotes (if logged in)
- Returns filtered and ordered quotes

#### getQuotesByAuthor()
```typescript
export const getQuotesByAuthor = async (
  author: string,
  userId?: string
): Promise<Quote[]>
```
- Filters quotes by author name
- Includes user's quotes + public quotes (if logged in)
- Case-sensitive matching

#### addQuote()
```typescript
export const addQuote = async (quoteData: {
  text: string;
  author: string;
  moods: MoodType[];
  userId: string;
  isPublic?: boolean;
}): Promise<Quote>
```
- Adds new quote to Firestore
- Sets creation timestamp
- Returns created quote with ID

#### updateQuote()
```typescript
export const updateQuote = async (
  quoteId: string,
  userId: string,
  updates: {
    text?: string;
    author?: string;
    moods?: MoodType[];
    isPublic?: boolean;
  },
  userEmail?: string
): Promise<Quote>
```
- Updates existing quote
- Validates user permission (owner or system admin)
- Returns updated quote
- Throws error if unauthorized

#### deleteQuote()
```typescript
export const deleteQuote = async (
  quoteId: string,
  userId: string,
  userEmail?: string
): Promise<void>
```
- Deletes quote from Firestore
- Validates user permission (owner or system admin)
- Throws error if unauthorized

#### clearUserData()
```typescript
export const clearUserData = async (userId: string): Promise<void>
```
- Deletes all quotes created by user
- Used for account cleanup
- Does not delete user profile

#### seedInitialQuotes()
```typescript
export const seedInitialQuotes = async (): Promise<void>
```
- Seeds database with initial quote collection
- Creates system quotes (userId: 'system')
- Used for database initialization
- Includes quotes from famous thinkers

#### getAllAuthors()
```typescript
export const getAllAuthors = async (userId?: string): Promise<string[]>
```
- Fetches all unique author names from quotes
- Includes user's quotes + public quotes (if logged in)
- Returns deduplicated author names
- Sorted alphabetically by default
- **Note:** In api.ts, results are sorted by recent usage via localStorage tracking

#### getAllTags()
```typescript
export const getAllTags = async (userId?: string): Promise<string[]>
```
- Fetches all unique custom tags from quotes
- Excludes fixed mood tags (excited, innovation, not-my-day, reflection)
- Includes user's quotes + public quotes (if logged in)
- Returns deduplicated tag names
- Sorted alphabetically by default
- **Note:** In api.ts, results are sorted by recent usage via localStorage tracking

---

## High-Level API Service

**Location:** `src/services/firebase/api.ts`

**Purpose:** Provides unified API that combines Firestore data with fallback mock data.

### Mock Data
Contains 20+ curated quotes from famous thinkers:
- Charlie Munger - Investment wisdom
- Steve Jobs - Innovation philosophy
- Elon Musk - First principles thinking
- Peter Thiel - Zero-to-one concepts
- Adam Grant - Originality and growth
- Benjamin Franklin - Wisdom quotes
- Bjorn Natthiko Lindeblad - Happiness philosophy
- Kevin Kelly - Future optimism

### API Functions

All functions are re-exports from Firestore service with fallback to mock data:

```typescript
export {
  getInitialQuotes,
  getQuotesByMood,
  getQuotesByAuthor,
  addQuote,
  getUserQuotes,
  deleteQuote,
  updateQuote,
  clearUserData,
  getAllAuthors,
  getAllTags
};
```

### Usage Tracking Enhancement

**Location:** `src/utils/recentUsageTracker.ts`

The API layer integrates with a localStorage-based usage tracking system to enhance user experience:

**Features:**
- Tracks author and tag selection frequency
- Sorts results by most recent usage (within 24 hours, then by usage count)
- Stores up to 100 records per category
- Automatically applied to `getAllAuthors()` and `getAllTags()`
- Used by AddQuoteModal for autocomplete suggestions and quick select

**Functions:**
```typescript
export const trackAuthorUsage = (author: string): void
export const trackTagUsage = (tag: string): void
export const getAuthorRecords = (): UsageRecord[]
export const getTagRecords = (): UsageRecord[]
export const sortByUsageData = (items: string[], records: UsageRecord[]): string[]
export const clearUsageData = (): void
```

**Storage:**
- Key: `quoteswipe_recent_usage`
- Format: `{ authors: UsageRecord[], tags: UsageRecord[] }`
- UsageRecord: `{ value: string, lastUsed: number, count: number }`

### Fallback Behavior
- Primary: Firestore database
- Fallback: Mock data if Firestore unavailable
- Ensures app works during development/offline
- Usage tracking works independently of data source

---

## Usage Examples

### In Components

**Importing services:**
```typescript
// From pages/SwipeInterface
import {
  getInitialQuotes,
  getQuotesByMood,
  addQuote
} from '../../services/firebase/api';

// From features
import { useAuth } from '../../../contexts/AuthContext';
```

**Fetching quotes:**
```typescript
const loadQuotes = async () => {
  try {
    const quotes = await getInitialQuotes(user?.uid, true);
    setQuotes(quotes);
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
};
```

**Adding a quote:**
```typescript
const handleAddQuote = async (quoteData) => {
  if (!user) return;

  try {
    await addQuote({
      ...quoteData,
      userId: user.uid,
      isPublic: quoteData.isPublic || false
    });

    // Refresh quotes
    await loadQuotes();
  } catch (error) {
    console.error('Error adding quote:', error);
  }
};
```

**Authentication:**
```typescript
import { useAuth } from '../../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };
};
```

---

## Data Flow

```
Component
    |
    v
services/firebase/api.ts (High-level API)
    |
    v
services/firebase/firestore.ts (Firestore operations)
    |
    v
services/firebase/config.ts (Firebase instance)
    |
    v
Firestore Database
```

**Authentication Flow:**
```
Component
    |
    v
contexts/AuthContext.tsx (State management)
    |
    v
services/firebase/auth.ts (Auth operations)
    |
    v
services/firebase/config.ts (Firebase Auth instance)
    |
    v
Firebase Authentication
```

---

## Error Handling

### Firestore Operations
- All async functions throw errors on failure
- Components should wrap calls in try-catch
- Errors logged to console for debugging

### Authentication
- Sign-in errors caught and displayed to user
- Auth state changes handled by AuthContext
- Automatic retry on network errors

### Best Practices
```typescript
// Always handle errors
try {
  const quotes = await getQuotesByMood('excited', user?.uid);
  setQuotes(quotes);
} catch (error) {
  console.error('Failed to load quotes:', error);
  // Show user-friendly error message
  setError('Unable to load quotes. Please try again.');
}
```

---

## Permission System

### Quote Permissions
- **Create**: Authenticated users only
- **Read**: Public quotes (all) + own quotes (authenticated)
- **Update/Delete**: Quote owner or system admin (Gmail users)

### System Admin
- Users with Gmail accounts (@gmail.com)
- Can edit/delete system quotes (userId: 'system')
- Full access to maintain quote collection

### Public vs Private Quotes
- **Public quotes**: Visible to all users
- **Private quotes**: Only visible to creator
- Set via `isPublic` flag when creating quote

---

## Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Future Improvements

### Planned Features
1. Real-time quote updates via Firestore listeners
2. Quote rating and popularity system
3. Advanced filtering (multiple moods, date ranges)
4. Quote search functionality
5. Social sharing features
6. Offline support with local caching
7. Quote collections/favorites

### Performance Optimizations
1. Implement pagination for large quote collections
2. Add query result caching
3. Optimize Firestore indexes
4. Lazy load user quotes
5. Batch operations for bulk updates

---

## Migration Notes

### Old Structure → New Structure
- `src/lib/firebase.ts` → `src/services/firebase/config.ts`
- `src/lib/firebaseAuth.ts` → `src/services/firebase/auth.ts`
- `src/lib/firestoreApi.ts` → `src/services/firebase/firestore.ts`
- `src/services/firebaseApi.ts` → `src/services/firebase/api.ts`

### Import Path Changes
```typescript
// Old imports
import { auth, db } from '../lib/firebase';
import { signInWithGoogle } from '../lib/firebaseAuth';
import { getQuotes } from '../services/firebaseApi';

// New imports
import { auth, db } from '../services/firebase/config';
import { signInWithGoogle } from '../services/firebase/auth';
import { getQuotes } from '../services/firebase/api';
```
