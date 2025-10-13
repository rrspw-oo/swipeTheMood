import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodType } from '../../../types';

interface MoodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: MoodType | null) => void;
  currentMood: MoodType | null;
}

const moods: { label: MoodType; displayName: string; description: string; color: string }[] = [
  {
    label: 'excited',
    displayName: 'Excited',
    description: 'Stay humble and grounded',
    color: 'from-yellow-400 to-orange-400'
  },
  {
    label: 'innovation',
    displayName: 'Innovation',
    description: 'Zero to one mindset',
    color: 'from-blue-400 to-purple-400'
  },
  {
    label: 'not-my-day',
    displayName: 'Not My Day',
    description: 'Push through the tough times',
    color: 'from-gray-400 to-slate-400'
  },
  {
    label: 'reflection',
    displayName: 'Reflection',
    description: 'Deep thoughts and wisdom',
    color: 'from-pink-400 to-rose-400'
  },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({
  isOpen,
  onClose,
  onSelectMood,
  currentMood
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0 bg-background-primary rounded-t-3xl
              shadow-2xl z-50 max-h-[80vh] overflow-hidden
            "
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-border-medium rounded-full"></div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Select Your Mood
                </h2>
                <p className="text-sm text-border-medium">
                  Get reminders tailored for your current state
                </p>
              </div>

              {/* Mood Options */}
              <div className="space-y-3 mb-6">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.label}
                    className={`
                      w-full p-4 rounded-2xl border-2 text-left transition-all
                      ${currentMood === mood.label
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-border-light bg-background-card hover:border-primary-300'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectMood(mood.label)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${mood.color}
                        flex items-center justify-center text-white text-sm font-bold mr-4
                      `}>
                        {mood.displayName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {mood.displayName}
                        </p>
                        <p className="text-xs text-border-medium">
                          {mood.description}
                        </p>
                      </div>
                      {currentMood === mood.label && (
                        <div className="text-primary-500 text-xl">
                          ✓
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  className="
                    flex-1 py-3 px-6 bg-border-divider text-gray-600 rounded-xl
                    font-medium
                  "
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectMood(null)}
                >
                  Show All
                </motion.button>
                <motion.button
                  className="
                    flex-1 py-3 px-6 bg-primary-500 text-white rounded-xl
                    font-medium
                  "
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                >
                  Done
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoodSelector;