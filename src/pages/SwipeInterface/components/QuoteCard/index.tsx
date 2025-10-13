import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, MoodType } from '../../../../types';

interface QuoteCardProps {
  quote: Quote;
  className?: string;
  onAuthorClick?: (author: string) => void;
  onMoodClick?: (mood: MoodType) => void;
  onEditClick?: (quote: Quote) => void;
  onDeleteClick?: (quoteId: string) => void;
  canEdit?: boolean;
  filterInfo?: {
    type: 'author' | 'mood';
    value: string;
    count: number;
    onClear: () => void;
  };
}

const QuoteCard: React.FC<QuoteCardProps> = React.memo(({
  quote,
  className = '',
  onAuthorClick,
  onMoodClick,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  filterInfo
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Determine color theme based on quote type
  const isVitality = quote.type === 'vitality';
  const themeColors = {
    gradient: isVitality
      ? 'from-[#B8A9D4] to-[#9D8BB8]'
      : 'from-primary-500 to-secondary-400',
    editButton: isVitality
      ? 'bg-[#D5C7EA] hover:bg-[#C9B9DF] text-[#6B5B8E]'
      : 'bg-[#FFC0E6] hover:bg-[#FFB8E1] text-[#8B5AA3]',
    deleteButton: isVitality
      ? 'bg-[#E8E0F5] hover:bg-[#DDD3EB] text-[#6B5B8E]'
      : 'bg-[#FFD6EF] hover:bg-[#FFCFEA] text-[#8B5AA3]',
    moodTag: isVitality
      ? 'bg-[#B8A9D4] hover:bg-[#A697C3] text-white'
      : 'bg-theme-moodBg hover:bg-theme-moodHoverBg text-theme-moodText',
    clearFilter: isVitality
      ? 'text-[#B8A9D4] hover:text-[#A697C3]'
      : 'text-primary-500 hover:text-primary-600'
  };

  const handleMouseEnter = () => {
    if (canEdit) {
      setShowButtons(true);
    }
  };

  const handleMouseLeave = () => {
    setShowButtons(false);
  };

  const handleTouchStart = () => {
    if (canEdit) {
      setIsLongPressing(false);
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        setShowButtons(true);
        // Vibrate if supported (optional feedback)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 1000); // 1 second long press
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Hide buttons after a delay if it was a long press
    if (isLongPressing) {
      setTimeout(() => {
        setShowButtons(false);
        setIsLongPressing(false);
      }, 3000); // Hide after 3 seconds
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };
  return (
    <div
      className="w-full max-w-sm mx-auto relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >

      <motion.div
        className={`
          bg-theme-cardBg rounded-2xl shadow-lg
          border border-theme-cardBorder p-8 text-center
          ${className}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Quote Text */}
        <div className="mb-6">
          <p className="text-lg text-gray-800 leading-relaxed">
            {quote.text}
          </p>
        </div>

        {/* Author Button - Centered under quote */}
        {quote.author && (
          <div className="mb-6 flex justify-center">
            <button
              className="
                px-4 py-2 rounded-full bg-theme-authorBg text-theme-authorText
                cursor-pointer hover:bg-theme-authorHoverBg active:scale-95 transition-all
              "
              onClick={() => onAuthorClick?.(quote.author!)}
            >
              {quote.author}
            </button>
          </div>
        )}

        {/* Mood Tags - Centered */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {quote.moods.map((mood, index) => (
            <button
              key={index}
              className={`
                px-3 py-1 text-xs rounded-full
                font-medium shadow-sm cursor-pointer
                active:scale-95 transition-all
                ${themeColors.moodTag}
              `}
              onClick={() => onMoodClick?.(mood as MoodType)}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="mt-2 flex justify-center">
          <div className={`w-12 h-1 bg-gradient-to-r ${themeColors.gradient} rounded-full opacity-60`}></div>
        </div>

        {/* Edit/Delete Buttons - Below gradient bar, centered */}
        {canEdit && (
          <motion.div
            className="flex justify-center space-x-2 mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: showButtons ? 1 : 0,
              scale: showButtons ? 1 : 0.8
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ pointerEvents: showButtons ? 'auto' : 'none' }}
          >
            <motion.button
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${themeColors.editButton}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.(quote);
                setShowButtons(false); // Hide after action
              }}
              title="Edit quote"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            <motion.button
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${themeColors.deleteButton}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick?.(quote.id);
                setShowButtons(false); // Hide after action
              }}
              title="Delete quote"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Filter Info - Outside of card */}
      {filterInfo && (
        <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
          <p>
            {filterInfo.type === 'author' && `Author: ${filterInfo.value}`}
            {filterInfo.type === 'mood' && `Mood: ${filterInfo.value}`}
            {' • '}{filterInfo.count} quotes
          </p>
          <button
            className={`ml-2 text-xs ${themeColors.clearFilter}`}
            onClick={filterInfo.onClear}
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
});

QuoteCard.displayName = 'QuoteCard';

export default QuoteCard;