import React from 'react';
import { motion } from 'framer-motion';
import HexagonIcon from '../HexagonIcon';

export type ViewMode = 'default' | 'alternative';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onToggle: () => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentMode, onToggle }) => {
  // Use purple color for alternative mode, pink for default
  const bgColor = currentMode === 'alternative' ? 'bg-[#C5B8E0]' : 'bg-transparent';
  const iconColor = currentMode === 'alternative' ? 'text-white' : 'text-primary-500';

  return (
    <motion.button
      onClick={onToggle}
      className={`
        relative w-10 h-10 rounded-full flex items-center justify-center
        transition-colors
        ${bgColor}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={currentMode === 'default' ? 'Switch to Alternative View' : 'Switch to Default View'}
    >
      <motion.div
        className={`w-5 h-5 transition-colors ${iconColor}`}
        animate={{ rotate: currentMode === 'alternative' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <HexagonIcon filled={currentMode === 'alternative'} />
      </motion.div>
    </motion.button>
  );
};

export default ViewModeToggle;
