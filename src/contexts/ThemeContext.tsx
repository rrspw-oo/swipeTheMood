import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'default' | 'inverted';

interface ThemeColors {
  primary: {
    background: string;
    button: string;
    surface: string;
    text: string;
  };
  secondary: {
    tag: string;
    tagLight: string;
    tagLighter: string;
  };
  author: {
    background: string;
    text: string;
    border: string;
    hoverBackground: string;
    hoverBorder: string;
  };
  card: {
    background: string;
    border: string;
  };
  mood: {
    background: string;
    text: string;
    hoverBackground: string;
  };
  tab: {
    activeBackground: string;
    activeText: string;
    inactiveBackground: string;
    inactiveText: string;
  };
  other: {
    border: string;
    lining: string;
    disabled: string;
  };
}

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const defaultTheme: ThemeColors = {
  primary: {
    background: '#f8fafc',
    button: '#f1f5f9',
    surface: '#e2e8f0',
    text: '#cbd5e1',
  },
  secondary: {
    tag: '#F7AAD6',
    tagLight: '#FFC0E6',
    tagLighter: '#FFD6EF',
  },
  author: {
    background: '#F1F1F1',
    text: '#BABCBD',
    border: 'transparent',
    hoverBackground: '#e5e5e5',
    hoverBorder: 'transparent',
  },
  card: {
    background: '#f8f8f8',
    border: '#e2e8f0',
  },
  mood: {
    background: '#F7AAD6',
    text: '#ffffff',
    hoverBackground: '#f472b6',
  },
  tab: {
    activeBackground: '#F7AAD6',
    activeText: '#ffffff',
    inactiveBackground: 'transparent',
    inactiveText: '#6b7280',
  },
  other: {
    border: '#f8f8f8',
    lining: '#f0f0f0',
    disabled: '#e8e8e8',
  },
};

const invertedTheme: ThemeColors = {
  primary: {
    background: '#F1F5F9',
    button: '#e2e8f0',
    surface: '#cbd5e1',
    text: '#64748b',
  },
  secondary: {
    tag: '#94a3b8',
    tagLight: '#cbd5e1',
    tagLighter: '#e2e8f0',
  },
  author: {
    background: '#F0F6FC',
    text: '#BABCBD',
    border: 'transparent',
    hoverBackground: '#e1e7ed',
    hoverBorder: 'transparent',
  },
  card: {
    background: '#E2E8F0',
    border: '#cbd5e1',
  },
  mood: {
    background: '#F0F6FC',
    text: '#64758B',
    hoverBackground: '#e1e7ed',
  },
  tab: {
    activeBackground: '#F0F6FC',
    activeText: '#64758B',
    inactiveBackground: 'transparent',
    inactiveText: '#94a3b8',
  },
  other: {
    border: '#cbd5e1',
    lining: '#f0f0f0',
    disabled: '#e8e8e8',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('default');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('quoteswipe-theme') as ThemeType;
    if (savedTheme === 'inverted') {
      setTheme('inverted');
    }
  }, []);

  // Update CSS variables when theme changes
  useEffect(() => {
    const colors = theme === 'default' ? defaultTheme : invertedTheme;
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--color-primary-background', colors.primary.background);
    root.style.setProperty('--color-primary-button', colors.primary.button);
    root.style.setProperty('--color-primary-surface', colors.primary.surface);
    root.style.setProperty('--color-primary-text', colors.primary.text);

    root.style.setProperty('--color-secondary-tag', colors.secondary.tag);
    root.style.setProperty('--color-secondary-tag-light', colors.secondary.tagLight);
    root.style.setProperty('--color-secondary-tag-lighter', colors.secondary.tagLighter);

    root.style.setProperty('--color-author-background', colors.author.background);
    root.style.setProperty('--color-author-text', colors.author.text);
    root.style.setProperty('--color-author-border', colors.author.border);
    root.style.setProperty('--color-author-hover-background', colors.author.hoverBackground);
    root.style.setProperty('--color-author-hover-border', colors.author.hoverBorder);

    root.style.setProperty('--color-card-background', colors.card.background);
    root.style.setProperty('--color-card-border', colors.card.border);

    root.style.setProperty('--color-mood-background', colors.mood.background);
    root.style.setProperty('--color-mood-text', colors.mood.text);
    root.style.setProperty('--color-mood-hover-background', colors.mood.hoverBackground);

    root.style.setProperty('--color-tab-active-background', colors.tab.activeBackground);
    root.style.setProperty('--color-tab-active-text', colors.tab.activeText);
    root.style.setProperty('--color-tab-inactive-background', colors.tab.inactiveBackground);
    root.style.setProperty('--color-tab-inactive-text', colors.tab.inactiveText);

    root.style.setProperty('--color-other-border', colors.other.border);
    root.style.setProperty('--color-other-lining', colors.other.lining);
    root.style.setProperty('--color-other-disabled', colors.other.disabled);

    // Add theme class to body
    document.body.classList.toggle('theme-inverted', theme === 'inverted');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'default' ? 'inverted' : 'default';
    setTheme(newTheme);
    localStorage.setItem('quoteswipe-theme', newTheme);
  };

  const colors = theme === 'default' ? defaultTheme : invertedTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};