import React from 'react';
import { motion } from 'framer-motion';
import { TabType, ViewMode } from '../../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  viewMode?: ViewMode;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, viewMode = 'default' }) => {
  const defaultTabs = [
    { id: 'random' as TabType, label: 'Random' },
    { id: 'mood' as TabType, label: 'Mood' }
  ];

  const alternativeTabs = [
    { id: 'vitality' as TabType, label: 'Vitality' },
    { id: 'paradigm' as TabType, label: 'Paradigm' }
  ];

  const tabs = viewMode === 'alternative' ? alternativeTabs : defaultTabs;

  // Different styling for alternative mode - elegant purple-gray theme
  const containerBg = viewMode === 'alternative' ? 'bg-[#E8E4F3]' : 'bg-background-secondary';
  const activeIndicatorBg = viewMode === 'alternative' ? 'bg-[#C5B8E0]' : 'bg-theme-tabActiveBg';
  const activeTextColor = viewMode === 'alternative' ? 'text-[#5B4A7D]' : 'text-theme-tabActiveText';
  const inactiveTextColor = viewMode === 'alternative' ? 'text-[#9D8DB5] hover:text-[#5B4A7D]' : 'text-theme-tabInactiveText hover:text-gray-700';

  return (
    <div className={`${containerBg} rounded-2xl p-1 mx-6 mb-4`}>
      <div className="flex relative">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`
              flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-colors relative z-10
              ${activeTab === tab.id ? activeTextColor : inactiveTextColor}
            `}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}

        <motion.div
          className={`absolute inset-y-1 ${activeIndicatorBg} rounded-xl shadow-sm`}
          initial={false}
          animate={{
            x: tabs.findIndex(tab => tab.id === activeTab) === 0 ? 0 : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          style={{
            width: '50%'
          }}
        />
      </div>
    </div>
  );
};

export default TabNavigation;