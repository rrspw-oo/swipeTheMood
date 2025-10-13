import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import UserCardsModal from '../UserCardsModal';
import { clearUserData } from '../../../services/firebase/api';
import { ViewMode } from '../../../types';

interface UserProfileProps {
  onSignInClick: () => void;
  viewMode?: ViewMode;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSignInClick, viewMode = 'default' }) => {
  const { user, isAuthenticated, signOut, userProfile, isLoading } = useAuth();
  const [isUserCardsOpen, setIsUserCardsOpen] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearAllData = async () => {
    if (!user?.uid) return;

    const confirmMessage = `Are you sure you want to clear all your data? This action cannot be undone and will delete all your quotes permanently.`;
    if (!confirm(confirmMessage)) return;

    setIsClearingData(true);
    try {
      await clearUserData(user.uid);
      alert('All your data has been cleared successfully.');
    } catch (error) {
      console.error('Error clearing user data:', error);
      alert('Failed to clear your data. Please try again.');
    } finally {
      setIsClearingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const buttonStyles = viewMode === 'alternative'
      ? 'bg-[#E8E4F3] border-[#DDD6EB] text-[#9D8DB5] hover:bg-[#DDD6EB] hover:text-[#5B4A7D]'
      : 'bg-border-divider border-border-light text-border-medium hover:bg-primary-100 hover:text-primary-600';

    return (
      <motion.button
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          transition-all border
          ${buttonStyles}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSignInClick}
        title="Sign in to save quotes"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </motion.button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="
          w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500
          cursor-pointer
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="
              absolute right-0 top-12 w-64 bg-background-card rounded-xl shadow-lg
              border border-border-light p-4 z-50
            "
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
        {/* User Info */}
        <div className="mb-4 pb-4 border-b border-border-light">
          <p className="font-medium text-gray-800 truncate">
            {user.displayName || 'Anonymous User'}
          </p>
          <p className="text-sm text-border-medium truncate">
            {user.email}
          </p>
        </div>

        {/* Stats */}
        {userProfile && (
          <div className="mb-4 pb-4 border-b border-border-light">
            <div className="flex justify-between text-sm">
              <span className="text-border-medium">Quotes Created:</span>
              <span className="font-medium text-gray-800">
                {userProfile.quotesCreated}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-border-medium">Member since:</span>
              <span className="font-medium text-gray-800">
                {userProfile.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Menu Actions */}
        <div className="space-y-2 mb-4 pb-4 border-b border-border-light">
          {/* See All Cards Button */}
          <motion.button
            className="
              w-full py-2 px-3 text-sm text-left text-gray-700 hover:bg-gray-50
              rounded-lg transition-colors flex items-center
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUserCardsOpen(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H3m14 8H7" />
            </svg>
            See All Cards
          </motion.button>

          {/* Clear All Data Button */}
          <motion.button
            className="
              w-full py-2 px-3 text-sm text-left text-orange-600 hover:bg-orange-50
              rounded-lg transition-colors flex items-center disabled:opacity-50
            "
            whileHover={{ scale: isClearingData ? 1 : 1.02 }}
            whileTap={{ scale: isClearingData ? 1 : 0.98 }}
            onClick={handleClearAllData}
            disabled={isClearingData}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isClearingData ? 'Clearing...' : 'Clear All Data'}
          </motion.button>
        </div>

        {/* Sign Out Button */}
        <motion.button
          className="
            w-full py-2 px-3 text-sm text-red-600 hover:bg-red-50
            rounded-lg transition-colors flex items-center
          "
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut()}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Cards Modal */}
      <UserCardsModal
        isOpen={isUserCardsOpen}
        onClose={() => setIsUserCardsOpen(false)}
      />
    </div>
  );
};

export default UserProfile;