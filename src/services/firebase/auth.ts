import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  quotesCreated: number;
}

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user profile in Firestore
    const userProfile = await createOrUpdateUserProfile(user);
    return userProfile;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const createOrUpdateUserProfile = async (user: User): Promise<UserProfile> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  const now = new Date();

  if (userDoc.exists()) {
    // Update existing user's last login
    const existingData = userDoc.data();
    const updatedProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      createdAt: existingData.createdAt.toDate(),
      lastLoginAt: now,
      quotesCreated: existingData.quotesCreated || 0
    };

    await setDoc(userDocRef, {
      ...updatedProfile,
      lastLoginAt: Timestamp.fromDate(now)
    }, { merge: true });

    return updatedProfile;
  } else {
    // Create new user profile
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      createdAt: now,
      lastLoginAt: now,
      quotesCreated: 0
    };

    await setDoc(userDocRef, {
      ...newProfile,
      createdAt: Timestamp.fromDate(now),
      lastLoginAt: Timestamp.fromDate(now)
    });

    return newProfile;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};