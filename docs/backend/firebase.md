# Firebase Configuration Documentation

## Overview
This document describes the Firebase setup, configuration, and integration strategy for the QuoteSwipe application.

**Status:** 📋 **Planning Phase** - Firebase not yet configured in production

---

## Project Setup

### Firebase Console Configuration

#### 1. Project Creation
```bash
# Create new Firebase project
firebase projects:create quote-swipe-app

# Initialize Firebase in project directory
firebase init
```

#### 2. Services to Enable
- **Firestore Database** - Primary data storage
- **Authentication** - Future user management
- **Hosting** - Static site deployment
- **Cloud Functions** - Future serverless functions (if needed)

#### 3. Billing Plan
- **Development:** Spark Plan (Free tier)
- **Production:** Blaze Plan (Pay-as-you-go)

---

## Environment Configuration

### Development Environment
**File:** `.env` (not committed to git)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_development_api_key
VITE_FIREBASE_AUTH_DOMAIN=quote-swipe-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quote-swipe-dev
VITE_FIREBASE_STORAGE_BUCKET=quote-swipe-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Production Environment
**File:** `.env.production`
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=quote-swipe-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quote-swipe-prod
VITE_FIREBASE_STORAGE_BUCKET=quote-swipe-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:fedcba654321
```

### Example Template
**File:** `.env.example`
```bash
# Firebase Configuration (for future implementation)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Firebase SDK Integration

### Installation
```bash
npm install firebase
```

### Configuration File
**File:** `src/config/firebase.ts` (to be created)
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
```

### Updated Service Implementation
**File:** `src/services/firebaseApi.ts` (updated implementation)
```typescript
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Quote, MoodType } from '../types';

export const getInitialQuotes = async (): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, 'quotes');
    const q = query(quotesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Quote[];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw new Error('Failed to fetch quotes');
  }
};

export const getQuotesByMood = async (mood: MoodType): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, 'quotes');
    const q = query(
      quotesRef,
      where('moods', 'array-contains', mood),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Quote[];
  } catch (error) {
    console.error('Error fetching quotes by mood:', error);
    throw new Error(`Failed to fetch quotes for mood: ${mood}`);
  }
};

export const addQuote = async (
  quoteData: Omit<Quote, 'id' | 'createdAt'>
): Promise<Quote> => {
  try {
    const quotesRef = collection(db, 'quotes');
    const docRef = await addDoc(quotesRef, {
      ...quoteData,
      createdAt: Timestamp.now()
    });

    const newQuote: Quote = {
      id: docRef.id,
      ...quoteData,
      createdAt: new Date()
    };

    return newQuote;
  } catch (error) {
    console.error('Error adding quote:', error);
    throw new Error('Failed to add quote');
  }
};
```

---

## Firestore Configuration

### Rules Configuration
**File:** `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quotes collection - public read, admin write
    match /quotes/{quoteId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.admin == true;
    }

    // Future: User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### Indexes Configuration
**File:** `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "moods",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "author",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Hosting Configuration

### Firebase Hosting Setup
**File:** `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Deployment Commands
```bash
# Build and deploy
npm run build
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

---

## Authentication (Future)

### Authentication Configuration
```typescript
// src/services/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
```

### Admin Claims (Future)
```javascript
// Firebase Admin SDK - set admin claims
admin.auth().setCustomUserClaims(uid, { admin: true });
```

---

## Performance Monitoring

### Firebase Performance SDK
```bash
npm install firebase-performance
```

```typescript
// src/config/firebase.ts
import { getPerformance } from 'firebase/performance';

// Initialize Performance Monitoring
export const perf = getPerformance(app);
```

### Custom Traces
```typescript
// Track quote loading performance
import { trace } from 'firebase/performance';
import { perf } from '../config/firebase';

export const getQuotesWithTracking = async (): Promise<Quote[]> => {
  const t = trace(perf, 'load_quotes');
  t.start();

  try {
    const quotes = await getInitialQuotes();
    t.stop();
    return quotes;
  } catch (error) {
    t.stop();
    throw error;
  }
};
```

---

## Local Development

### Firebase Emulator Suite
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Emulator Configuration
**File:** `firebase.json` (emulators section)
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Development Connection
```typescript
// src/config/firebase.ts (development mode)
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

if (import.meta.env.DEV) {
  // Connect to emulators in development
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## Security Configuration

### API Key Restrictions
```javascript
// Google Cloud Console - API Key restrictions
{
  "http_referrers": [
    "https://your-domain.com/*",
    "https://your-domain.firebaseapp.com/*"
  ],
  "apis": [
    "Firebase Installations API",
    "Cloud Firestore API",
    "Firebase Remote Config API"
  ]
}
```

### Security Headers
```javascript
// firebase.json hosting headers
{
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Migration Timeline

### Phase 1: Setup (Week 1)
- [ ] Create Firebase project
- [ ] Configure development environment
- [ ] Set up emulators
- [ ] Update service layer

### Phase 2: Deployment (Week 2)
- [ ] Configure production environment
- [ ] Set up Firestore rules and indexes
- [ ] Deploy initial version
- [ ] Seed database with quotes

### Phase 3: Optimization (Week 3)
- [ ] Add performance monitoring
- [ ] Implement caching strategies
- [ ] Set up backup procedures
- [ ] Load testing and optimization