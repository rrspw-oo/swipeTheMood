import React from 'react';
import { motion } from 'framer-motion';
import { MoodType } from '../../../types';

interface MoodGridProps {
  onSelectMood: (mood: MoodType) => void;
}

const moods: { label: MoodType; displayName: string }[] = [
  {
    label: 'excited',
    displayName: 'Excited'
  },
  {
    label: 'innovation',
    displayName: 'Innovation'
  },
  {
    label: 'not-my-day',
    displayName: 'Not My Day'
  },
  {
    label: 'reflection',
    displayName: 'Reflection'
  }
];

const MoodGrid: React.FC<MoodGridProps> = ({ onSelectMood }) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Select Your Mood
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            className="
              px-6 py-4 rounded-xl font-medium text-center
              bg-theme-moodBg text-theme-moodText
              hover:bg-theme-moodHoverBg transition-colors
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMood(mood.label)}
          >
            {mood.displayName}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodGrid;