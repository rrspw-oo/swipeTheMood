import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { ViewMode } from '../../../types';

interface ThemeToggleProps {
  viewMode?: ViewMode;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ viewMode = 'default' }) => {
  const { theme, toggleTheme } = useTheme();

  // Different colors for alternative mode
  const bgColor = viewMode === 'alternative'
    ? 'bg-[#E8E4F3] border-[#DDD6EB] hover:bg-[#DDD6EB]'
    : 'bg-theme-primaryBtn border-theme-primarySurface hover:bg-theme-primarySurface';

  const iconColor = viewMode === 'alternative'
    ? 'text-[#9D8DB5]'
    : 'text-theme-secondaryTag';

  return (
    <motion.button
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        border transition-colors duration-200
        ${bgColor}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      title="Toggle color theme"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className={iconColor}
      >
        {theme === 'default' ? (
          // Palette icon for switching to inverted theme
          <path
            d="M12 3C16.97 3 21 7.03 21 12s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zM7 12a5 5 0 0010 0 5 5 0 00-10 0z"
            fill="currentColor"
          />
        ) : (
          // Sun/circle icon for switching back to default theme
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        )}
      </svg>
    </motion.button>
  );
};

export default ThemeToggle;