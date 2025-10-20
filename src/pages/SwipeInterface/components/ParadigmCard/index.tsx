import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, Foundation } from '../../../../types';

interface ParadigmCardProps {
  quote: Quote;
  onEditClick?: (quote: Quote) => void;
  onDeleteClick?: (quoteId: string) => void;
  canEdit?: boolean;
}

const ParadigmCard: React.FC<ParadigmCardProps> = ({
  quote,
  onEditClick,
  onDeleteClick,
  canEdit = false
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

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
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 1000);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLongPressing) {
      setTimeout(() => {
        setShowButtons(false);
        setIsLongPressing(false);
      }, 3000);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  const foundations = quote.foundations || [];

  return (
    <div
      className="w-full max-w-sm md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <motion.div
        className="
          w-full bg-theme-cardBg rounded-2xl shadow-lg
          border border-theme-cardBorder p-4 md:p-6
          min-h-[60vh] max-h-[75vh] flex flex-col
        "
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >

      {/* Theory Name */}
      <div className="mb-4">
        <motion.h2
          className="text-2xl font-bold text-gray-800 text-center break-words"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {quote.theory || 'Untitled Theory'}
        </motion.h2>
      </div>

      {/* Theory Description */}
      {foundations.length > 0 && foundations[0].description && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 text-center leading-relaxed px-2">
            {foundations[0].description}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-gray-300 mb-6"></div>

      {/* Foundations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 pb-2">
        {foundations.length > 0 ? (
          foundations.map((foundation: Foundation, index: number) => {
            const hasExamples = foundation.examples && foundation.examples.length > 0;

            return (
              <motion.div
                key={foundation.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {/* Foundation Title */}
                <h3 className="font-semibold text-gray-800 mb-4 flex items-baseline gap-2">
                  <span className="text-[#B8A9D4] font-bold text-lg shrink-0">{index + 1}.</span>
                  <span className="flex-1 break-words">{foundation.title}</span>
                </h3>

                {/* Examples List */}
                {hasExamples && (
                  <div className="space-y-2 pl-6">
                    {foundation.examples.map((example: string, exIndex: number) => (
                      <motion.div
                        key={exIndex}
                        className="
                          bg-white/80 rounded-lg p-3 text-sm text-gray-700
                          border border-[#B8A9D4]/20 break-words
                        "
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * exIndex }}
                      >
                        <span className="font-medium text-[#B8A9D4] inline-block shrink-0">
                          {index + 1}-{exIndex + 1}.
                        </span>{' '}
                        <span className="inline">{example}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No foundations added yet</p>
          </div>
        )}
      </div>

      {/* Tags Display */}
      {quote.moods && quote.moods.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {quote.moods.map((tag, index) => (
            <motion.div
              key={index}
              className="
                px-3 py-1 text-xs rounded-full
                font-medium shadow-sm
                bg-[#B8A9D4] text-white
              "
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
            >
              {tag}
            </motion.div>
          ))}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="mt-2 flex justify-center">
        <div className="w-12 h-1 bg-gradient-to-r from-[#B8A9D4] to-[#9D8BB8] rounded-full opacity-60"></div>
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
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-[#D5C7EA] hover:bg-[#C9B9DF] text-[#6B5B8E]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.(quote);
              setShowButtons(false);
            }}
            title="Edit paradigm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.button>
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-[#E8E0F5] hover:bg-[#DDD3EB] text-[#6B5B8E]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick?.(quote.id);
              setShowButtons(false);
            }}
            title="Delete paradigm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
};

export default ParadigmCard;
