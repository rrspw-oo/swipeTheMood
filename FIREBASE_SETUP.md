# Firebase Setup Guide

This guide will help you set up Firebase Firestore backend and Google Authentication for the Quote Swipe app.

## Prerequisites

- A Google account
- Node.js and npm installed
- The QuoteSwipe project files

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `quote-swipe` (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the sidebar
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle **Enable**
6. Set your support email
7. Click "Save"

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll set up security rules)
4. Select a location close to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Enter app nickname: `quote-swipe-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 5: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 6: Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init firestore`
4. Select your Firebase project
5. Use the provided `firestore.rules` file
6. Deploy rules: `firebase deploy --only firestore:rules`

## Step 7: Deploy Firebase Hosting (CRITICAL FOR GOOGLE AUTH)

**WARNING: Google Authentication WILL NOT WORK without Firebase Hosting deployment!**

Firebase Authentication relies on the `/__/auth/handler` endpoint which is only available after deploying to Firebase Hosting.

### Initial Deployment

1. Initialize Firebase Hosting (if not done):
   ```bash
   firebase init hosting
   ```
   - Select "Use an existing project"
   - Choose your Firebase project
   - Set public directory: `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

4. Verify deployment:
   - Visit your Hosting URL: `https://your-project.web.app`
   - Check that `https://your-project.firebaseapp.com/__/auth/handler` is accessible

### Why This Is Critical

The Google OAuth popup opens `https://your-project.firebaseapp.com/__/auth/handler` to handle authentication. If Hosting is not deployed:

- The popup will show your app's default page instead of Google login
- Users will see `auth/popup-closed-by-user` errors
- Login will completely fail in development (localhost)

**This must be done BEFORE testing Google Authentication, even in development!**

## Step 8: Test the Setup

1. Start the development server: `npm run dev`
2. Open http://localhost:4000
3. Try signing in with Google
4. Try creating a new quote
5. Check Firebase Console to see the data

## Security Rules Overview

The included `firestore.rules` provide:

- **Public quotes**: Anyone can read quotes marked as `isPublic: true`
- **Private quotes**: Only the owner can read their private quotes
- **User data**: Users can only access their own profile data
- **Quote creation**: Only authenticated users can create quotes
- **Validation**: All quote data is validated for proper format and size limits

## Troubleshooting

### Google Login Shows App Page Instead of Login Screen

**Symptom:** Clicking login opens a popup that shows your app's home page instead of Google's login page.

**Cause:** Firebase Hosting not deployed.

**Solution:**
```bash
npm run build
firebase deploy --only hosting
```

**Verification:**
1. Open browser console and run:
   ```javascript
   console.log('Auth Handler:', 'https://YOUR-PROJECT.firebaseapp.com/__/auth/handler');
   ```
2. Visit that URL - it should NOT show your app, but a Firebase auth page

### auth/popup-closed-by-user Error

**Symptom:** Login popup immediately closes with error `auth/popup-closed-by-user`.

**Cause:** The auth handler URL is redirecting to your app instead of Google OAuth.

**Solution:** Same as above - deploy Firebase Hosting.

### Authentication Issues
- Make sure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized in Firebase Auth settings
- Verify `localhost` is in the authorized domains list

### Firestore Permission Denied
- Verify security rules are deployed correctly
- Check browser console for specific error messages

### Environment Variables Not Working
- Make sure `.env.local` file exists in project root
- Restart development server after changing environment variables
- Verify all variable names start with `VITE_`

## Production Deployment

For production deployment:
1. Set up Firebase Hosting: `firebase init hosting`
2. Build the app: `npm run build`
3. Deploy: `firebase deploy`

## Data Migration

To migrate existing mock data to Firestore, the app includes a `seedInitialQuotes()` function in `firestoreApi.ts` that can be called to populate the database with initial quotes.

## Features Enabled

With this Firebase setup, your app now supports:

- **Google Authentication**: Users can sign in with their Google accounts
- **User Profiles**: Automatic user profile creation and management
- **Quote Management**: Create, read, and manage quotes with proper permissions
- **Public/Private Quotes**: Users can choose to share quotes publicly or keep them private
- **Real-time Data**: Changes sync across devices in real-time
- **Offline Support**: Firestore provides automatic offline caching
- **Security**: Comprehensive security rules protect user data