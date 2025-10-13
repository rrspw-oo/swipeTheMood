# Deployment Documentation

## Overview
This document describes the deployment process, environments, and infrastructure for the QuoteSwipe PWA application.

---

## Deployment Environments

### Development Environment
- **URL:** `http://localhost:5173` (Vite dev server)
- **Database:** Firebase Emulator Suite
- **Purpose:** Local development and testing
- **Hot reload:** Enabled
- **Source maps:** Enabled

### Staging Environment (Future)
- **URL:** `https://quote-swipe-staging.firebaseapp.com`
- **Database:** Firebase Firestore (staging project)
- **Purpose:** Pre-production testing
- **Source maps:** Enabled
- **Analytics:** Disabled

### Production Environment
- **URL:** `https://quote-swipe.firebaseapp.com` (planned)
- **Database:** Firebase Firestore (production project)
- **Purpose:** Live application
- **Source maps:** Disabled
- **Analytics:** Enabled
- **Performance monitoring:** Enabled

---

## Build Process

### Development Build
```bash
# Start development server
npm run dev

# Available at http://localhost:5173
# Features:
# - Hot Module Replacement (HMR)
# - Source maps for debugging
# - Vite dev server with proxy support
```

### Production Build
```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting (if available)
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── [asset-files]       # Images, fonts, etc.
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── pwa-[size]x[size].png   # PWA icons
```

---

## Firebase Hosting Deployment

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting
```

### Configuration Files

#### firebase.json
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
      },
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
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}
```

### Deployment Commands
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy with specific message
firebase deploy --only hosting -m "Deploy version 1.2.0"

# Deploy to specific project
firebase deploy --only hosting --project production
```

---

## CI/CD Pipeline (Future)

### GitHub Actions Workflow
**File:** `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run tests (when available)
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: quote-swipe-prod
        env:
          FIREBASE_CLI_EXPERIMENTS: webframeworks
```

---

## Environment Variables

### Required Environment Variables

#### Development (.env)
```bash
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=quote-swipe-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quote-swipe-dev
VITE_FIREBASE_STORAGE_BUCKET=quote-swipe-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Production (.env.production)
```bash
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=quote-swipe-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quote-swipe-prod
VITE_FIREBASE_STORAGE_BUCKET=quote-swipe-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:fedcba
```

### GitHub Secrets (for CI/CD)
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT` (JSON key for deployment)

---

## PWA Deployment Considerations

### Service Worker
```javascript
// Generated by Vite PWA plugin
// Handles offline caching and updates
// Configuration in vite.config.ts
```

### App Installation
```typescript
// Add to homescreen functionality
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button
});

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
};
```

### Offline Support
- **Quote browsing:** Cached quotes available offline
- **New quotes:** Queued for sync when online
- **App shell:** Always cached for instant loading

---

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Optimization Techniques
```typescript
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Asset optimization
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
        }
      }
    }
  }
});
```

### Performance Metrics Goals
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **First Input Delay:** < 100ms
- **Cumulative Layout Shift:** < 0.1

---

## SSL/HTTPS Configuration

### Firebase Hosting SSL
- **Automatic SSL:** Provided by Firebase Hosting
- **Certificate Management:** Handled automatically
- **HTTP to HTTPS:** Automatic redirect enabled

### Custom Domain (Future)
```bash
# Add custom domain
firebase hosting:sites:create quote-swipe-app

# Connect domain
firebase target:apply hosting production quote-swipe-app
```

---

## Monitoring and Analytics

### Performance Monitoring
```typescript
// Firebase Performance Monitoring
import { getPerformance } from 'firebase/performance';
import { app } from './firebase-config';

const perf = getPerformance(app);
```

### Error Tracking
```typescript
// Error boundary for production
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

### Analytics Setup
```typescript
// Google Analytics (future)
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// Track quote interactions
logEvent(analytics, 'quote_viewed', {
  mood: selectedMood,
  author: quote.author
});
```

---

## Rollback Procedures

### Firebase Hosting Rollback
```bash
# View deployment history
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:releases:rollback [RELEASE_ID]
```

### Emergency Procedures
1. **Immediate rollback** to last known good version
2. **Investigate issue** in staging environment
3. **Fix and redeploy** with proper testing
4. **Post-mortem analysis** to prevent recurrence

---

## Security Considerations

### Content Security Policy
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  connect-src 'self' *.googleapis.com *.firebaseapp.com;
  img-src 'self' data: blob:;
">
```

### API Security
- **Firestore rules:** Restrict database access
- **API key restrictions:** Limit to specific domains
- **CORS policies:** Configure allowed origins

---

## Backup and Recovery

### Firestore Backup
```bash
# Automated daily backups
gcloud firestore export gs://quote-swipe-backups/$(date +%Y%m%d)

# Restore from backup
gcloud firestore import gs://quote-swipe-backups/20240101
```

### Code Backup
- **GitHub repository:** Primary code storage
- **Release tags:** Mark stable versions
- **Firebase Hosting:** Automatic version history

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Performance metrics within targets
- [ ] Security headers configured

### Post-deployment
- [ ] Application loads correctly
- [ ] All features functional
- [ ] PWA installation works
- [ ] Mobile responsiveness verified
- [ ] Performance monitoring active
- [ ] Error tracking configured

### Rollback Plan
- [ ] Previous version identified
- [ ] Rollback procedure documented
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured