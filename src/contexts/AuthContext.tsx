import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthState, User } from '../types';
import {
  onAuthStateChange,
  signInWithGoogle,
  signOutUser,
  UserProfile,
  createOrUpdateUserProfile
} from '../services/firebase/auth';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined
        };

        const profile = await createOrUpdateUserProfile(firebaseUser);

        if (!isMounted) return;

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
        setUserProfile(profile);
      } else {
        if (!isMounted) return;

        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
        setUserProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async (): Promise<UserProfile | null> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await signInWithGoogle();
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signOutUser();
      // State will be updated through onAuthStateChanged
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    userProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
