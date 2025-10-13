import React from 'react';
import { motion } from 'framer-motion';

interface EmptyCardProps {
  className?: string;
  variant?: 'default' | 'alternative';
}

const EmptyCard: React.FC<EmptyCardProps> = ({ className = '', variant = 'default' }) => {
  const cardStyles = variant === 'alternative'
    ? 'bg-[#F5F3FA] border-[#DDD6EB]'
    : 'bg-theme-cardBg border-theme-cardBorder';

  const gradientStyles = variant === 'alternative'
    ? 'bg-gradient-to-r from-[#B8A9D4] to-[#D8CDE8]'
    : 'bg-gradient-to-r from-primary-500 to-secondary-400';

  return (
    <div className="w-full max-w-sm mx-auto relative">
      <motion.div
        className={`
          ${cardStyles} rounded-2xl shadow-lg
          border p-8 text-center
          min-h-[300px] flex items-center justify-center
          ${className}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Empty card - preserving swipe functionality but no content */}
        <div className="flex justify-center">
          <div className={`w-12 h-1 ${gradientStyles} rounded-full opacity-60`}></div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyCard;
