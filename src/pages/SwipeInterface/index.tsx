import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Quote, MoodType, TabType, FilterState, ViewMode, CreateQuoteData, CreateParadigmData } from '../../types';
import QuoteCard from './components/QuoteCard';
import ParadigmCard from './components/ParadigmCard';
import MoodGrid from '../../features/mood/MoodGrid';
import TabNavigation from '../../components/TabNavigation';
import ThemeToggle from '../../features/theme/ThemeToggle';
import ViewModeToggle from '../../components/ViewModeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { getInitialQuotes, getQuotesByMood, getQuotesByAuthor, addQuote, deleteQuote, updateQuote } from '../../services/firebase/api';

// Lazy load modal components
const AddQuoteModal = lazy(() => import('../../features/user/AddQuoteModal'));
const AddParadigmModal = lazy(() => import('../../features/user/AddParadigmModal'));
const LoginModal = lazy(() => import('../../features/user/LoginModal'));
const UserProfile = lazy(() => import('../../features/user/UserProfile'));

/**
 * Filter quotes by type
 * @param quotes - Array of quotes to filter
 * @param targetType - Target type to filter by ('quote', 'vitality', or 'paradigm')
 * @returns Filtered array of quotes
 */
const filterQuotesByType = (quotes: Quote[], targetType: 'quote' | 'vitality' | 'paradigm'): Quote[] => {
  if (targetType === 'quote') {
    // For 'quote' type, include quotes with type='quote' or undefined (legacy quotes)
    return quotes.filter(q => q.type === 'quote' || q.type === undefined);
  }
  // For 'vitality' and 'paradigm', filter exact matches
  return quotes.filter(q => q.type === targetType);
};

const SwipeInterface: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // Initialize state from localStorage
  const getInitialViewMode = (): ViewMode => {
    const saved = localStorage.getItem('viewMode');
    return (saved === 'alternative' || saved === 'default') ? saved : 'default';
  };

  const getInitialTab = (): TabType => {
    const saved = localStorage.getItem('activeTab');
    const validTabs: TabType[] = ['random', 'mood', 'author', 'vitality', 'paradigm'];
    return validTabs.includes(saved as TabType) ? (saved as TabType) : 'random';
  };

  const initialViewMode = getInitialViewMode();
  const initialTab = getInitialTab();

  const [filterState, setFilterState] = useState<FilterState>({
    type: initialTab,
    value: null
  });
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const controls = useAnimation();

  // View mode state (default or alternative)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // Cache for random mode quotes to avoid reloading on tab switch
  const [randomQuotesCache, setRandomQuotesCache] = useState<Quote[]>([]);

  // Utility function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load initial quotes
  useEffect(() => {
    loadQuotes();
  }, []);

  // Reload quotes when user authentication state changes
  useEffect(() => {
    if (user !== undefined) { // Only reload after auth state is determined
      loadQuotes();
    }
  }, [user?.uid]);

  const loadQuotes = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await getInitialQuotes(user?.uid, true);
      // Always shuffle quotes when loading to ensure random order
      const shuffledQuotes = shuffleArray(data);
      setRandomQuotesCache(shuffledQuotes); // Update cache

      // Filter quotes based on current active tab
      let filteredQuotes = shuffledQuotes;
      if (activeTab === 'vitality') {
        filteredQuotes = filterQuotesByType(shuffledQuotes, 'vitality');
      } else if (activeTab === 'paradigm') {
        filteredQuotes = filterQuotesByType(shuffledQuotes, 'paradigm');
      } else if (activeTab === 'random' || activeTab === 'mood' || activeTab === 'author') {
        // For default mode tabs (random, mood, author), only show 'quote' type
        filteredQuotes = filterQuotesByType(shuffledQuotes, 'quote');
      }

      setQuotes(filteredQuotes);
      setCurrentIndex(0);
      setHistory([]);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const loadQuotesByMood = async (mood: MoodType) => {
    setIsLoading(true);
    try {
      const data = await getQuotesByMood(mood, user?.uid);
      // Filter to only show 'quote' type (mood tab is only in default mode)
      const filteredData = filterQuotesByType(data, 'quote');
      // Shuffle mood quotes for random order
      const shuffledQuotes = shuffleArray(filteredData);
      setQuotes(shuffledQuotes);
      setCurrentIndex(0);
      setHistory([]);
    } catch (error) {
      console.error('Error loading quotes by mood:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Save tab to localStorage
    localStorage.setItem('activeTab', tab);

    if (tab === 'random') {
      setCurrentMood(null);
      setFilterState({ type: 'random', value: null });

      // Use cached random quotes if available, no loading screen
      if (randomQuotesCache.length > 0) {
        // Filter to only show 'quote' type
        const filteredQuotes = filterQuotesByType(randomQuotesCache, 'quote');
        setQuotes(filteredQuotes);
        setCurrentIndex(0);
        setHistory([]);
      } else {
        // Only load if cache is empty
        loadQuotes();
      }
    } else if (tab === 'vitality' || tab === 'paradigm') {
      setCurrentMood(null);
      setFilterState({ type: tab, value: null });

      // Filter quotes by type
      const targetType = tab === 'vitality' ? 'vitality' : 'paradigm';

      // Always filter from the latest cache
      if (randomQuotesCache.length > 0) {
        const filteredQuotes = filterQuotesByType(randomQuotesCache, targetType);
        setQuotes(filteredQuotes);
        setCurrentIndex(0);
        setHistory([]);
      } else {
        // If no cached data, load first
        loadQuotes();
      }
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    setCurrentMood(mood);
    setFilterState({ type: 'mood', value: mood });
    loadQuotesByMood(mood);
  };

  const handleAuthorClick = async (author: string) => {
    setIsLoading(true);
    try {
      setFilterState({ type: 'author', value: author });
      setActiveTab('author');
      const authorQuotes = await getQuotesByAuthor(author, user?.uid);
      // Filter to only show 'quote' type (author tab is only in default mode)
      const filteredQuotes = filterQuotesByType(authorQuotes, 'quote');
      // Shuffle author quotes for random order
      const shuffledQuotes = shuffleArray(filteredQuotes);
      setQuotes(shuffledQuotes);
      setCurrentIndex(0);
      setHistory([]);
    } catch (error) {
      console.error('Error loading quotes by author:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodClick = async (mood: MoodType) => {
    setCurrentMood(mood);
    setFilterState({ type: 'mood', value: mood });
    setActiveTab('mood');
    try {
      const moodQuotes = await getQuotesByMood(mood, user?.uid);
      // Filter to only show 'quote' type (mood tab is only in default mode)
      const filteredQuotes = filterQuotesByType(moodQuotes, 'quote');
      // Shuffle mood quotes for random order
      const shuffledQuotes = shuffleArray(filteredQuotes);
      setQuotes(shuffledQuotes);
      setCurrentIndex(0);
      setHistory([]);
    } catch (error) {
      console.error('Error loading quotes by mood:', error);
    }
  };

  const clearFilter = () => {
    setFilterState({ type: 'random', value: null });
    setActiveTab('random');
    setCurrentMood(null);

    // Use cached random quotes if available, no loading screen
    if (randomQuotesCache.length > 0) {
      // Filter to only show 'quote' type
      const filteredQuotes = filterQuotesByType(randomQuotesCache, 'quote');
      setQuotes(filteredQuotes);
      setCurrentIndex(0);
      setHistory([]);
    } else {
      loadQuotes();
    }
  };

  const handleAddQuote = async (quoteData: CreateQuoteData) => {
    if (!isAuthenticated || !user) {
      setIsLoginOpen(true);
      return;
    }

    try {
      if (editingQuote) {
        // Handle editing existing quote
        await handleUpdateQuote(quoteData);
      } else {
        // Handle adding new quote
        await addQuote({
          ...quoteData,
          userId: user.uid,
          isPublic: quoteData.isPublic || false,
          moods: quoteData.moods as string[]
        });

        // Refresh quotes list
        if (filterState.type === 'random') {
          await loadQuotes();
        } else if (filterState.type === 'mood' && filterState.value) {
          await loadQuotesByMood(filterState.value as MoodType);
        } else if (filterState.type === 'author' && filterState.value) {
          const authorQuotes = await getQuotesByAuthor(filterState.value as string, user?.uid);
          // Shuffle author quotes for random order
          const shuffledQuotes = shuffleArray(authorQuotes);
          setQuotes(shuffledQuotes);
        } else if (filterState.type === 'vitality' || filterState.type === 'paradigm') {
          // Reload quotes for vitality and paradigm tabs
          const data = await getInitialQuotes(user?.uid, true);
          const shuffledQuotes = shuffleArray(data);
          setRandomQuotesCache(shuffledQuotes);

          // Filter by current type
          const targetType = filterState.type;
          const filteredQuotes = shuffledQuotes.filter(q => q.type === targetType);
          setQuotes(filteredQuotes);
          setCurrentIndex(0);
          setHistory([]);
        }
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      throw error;
    }
  };

  const handleAddQuoteClick = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsAddQuoteOpen(true);
  };

  const handleEditQuote = (quote: Quote) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingQuote(quote);
    setIsAddQuoteOpen(true);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!user?.uid) return;

    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await deleteQuote(quoteId, user.uid, user.email);

      // Remove the deleted quote from the current list
      setQuotes(prev => prev.filter(q => q.id !== quoteId));

      // If we deleted the current quote, move to the next one or previous if it was the last
      if (quotes[currentIndex]?.id === quoteId) {
        if (currentIndex >= quotes.length - 1 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else if (currentIndex > 0 && quotes.findIndex(q => q.id === quoteId) < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Failed to delete quote. Please try again.');
    }
  };

  const handleUpdateQuote = async (updatedData: CreateQuoteData) => {
    if (!user?.uid || !editingQuote) return;

    try {
      const updatePayload = {
        text: updatedData.text,
        author: updatedData.author,
        moods: updatedData.moods as string[],
        isPublic: updatedData.isPublic,
        type: updatedData.type
      };

      const updatedQuote = await updateQuote(editingQuote.id, user.uid, updatePayload, user.email);

      // Update the quote in the current list
      setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));

      setIsAddQuoteOpen(false);
      setEditingQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const handleAddParadigm = async (paradigmData: CreateParadigmData) => {
    if (!isAuthenticated || !user) {
      setIsLoginOpen(true);
      return;
    }

    try {
      if (editingQuote) {
        // Handle editing existing paradigm
        console.log('Updating paradigm with data:', paradigmData);

        const updatePayload = {
          text: paradigmData.theory,
          author: '',
          moods: paradigmData.moods || [],
          isPublic: paradigmData.isPublic,
          type: 'paradigm' as const,
          theory: paradigmData.theory,
          foundations: paradigmData.foundations
        };

        await updateQuote(editingQuote.id, user.uid, updatePayload, user.email);
        console.log('Paradigm updated');

        // Update the current quotes list
        const updatedQuotes = quotes.map(q =>
          q.id === editingQuote.id
            ? { ...q, ...updatePayload }
            : q
        );
        setQuotes(updatedQuotes);

        // Also update the cache
        const updatedCache = randomQuotesCache.map(q =>
          q.id === editingQuote.id
            ? { ...q, ...updatePayload }
            : q
        );
        setRandomQuotesCache(updatedCache);

        setEditingQuote(null);
      } else {
        // Handle adding new paradigm
        console.log('Adding paradigm with data:', paradigmData);

        const newQuote = await addQuote({
          text: paradigmData.theory,
          author: '',
          moods: paradigmData.moods || [],
          userId: user.uid,
          isPublic: paradigmData.isPublic || false,
          type: 'paradigm',
          theory: paradigmData.theory,
          foundations: paradigmData.foundations
        });

        console.log('New quote added:', newQuote);

        // Refresh quotes list for paradigm tab
        const data = await getInitialQuotes(user?.uid, true);
        console.log('All quotes after adding:', data.length);

        const shuffledQuotes = shuffleArray(data);
        setRandomQuotesCache(shuffledQuotes);

        // Filter paradigm quotes only
        const paradigmQuotes = shuffledQuotes.filter(q => q.type === 'paradigm');
        console.log('Paradigm quotes filtered:', paradigmQuotes.length, paradigmQuotes);

        setQuotes(paradigmQuotes);
        setCurrentIndex(0);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error saving paradigm:', error);
      throw error;
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < quotes.length - 1) {
      setHistory(prev => [...prev, currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (history.length > 0) {
      const previousIndex = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentIndex(previousIndex);
    }
  };

  const handleDrag = (_event: any, info: PanInfo) => {
    const { offset } = info;
    const rotation = offset.x * 0.1;
    const scale = Math.max(0.95, 1 - Math.abs(offset.x) * 0.0005);

    controls.set({
      x: offset.x,
      rotate: rotation,
      scale: scale
    });
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 80;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 300) {
      const direction = offset > 0 ? 1 : -1;
      const exitX = direction * window.innerWidth * 1.2;
      const exitRotation = direction * 30;

      // Slide card off screen with rotation and scale
      controls.start({
        x: exitX,
        rotate: exitRotation,
        scale: 0.8,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: "easeOut",
          type: "tween"
        }
      }).then(() => {
        // Update card content
        if (direction > 0) {
          handleSwipeRight();
        } else {
          handleSwipeLeft();
        }

        // Show new card directly in place with no animation
        controls.set({
          x: 0,
          rotate: 0,
          scale: 1,
          opacity: 1
        });
      });
    } else {
      // Spring back to center
      controls.start({
        x: 0,
        rotate: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      });
    }
  };

  const handleViewModeToggle = () => {
    const newMode: ViewMode = viewMode === 'default' ? 'alternative' : 'default';
    setViewMode(newMode);

    // Save mode to localStorage
    localStorage.setItem('viewMode', newMode);

    // Reset to first tab of the new mode
    if (newMode === 'alternative') {
      const newTab: TabType = 'vitality';
      setActiveTab(newTab);
      setCurrentMood(null);
      setFilterState({ type: newTab, value: null });

      // Save tab to localStorage
      localStorage.setItem('activeTab', newTab);

      // Filter vitality quotes immediately
      if (randomQuotesCache.length > 0) {
        const vitalityQuotes = filterQuotesByType(randomQuotesCache, 'vitality');
        setQuotes(vitalityQuotes);
        setCurrentIndex(0);
        setHistory([]);
      } else {
        loadQuotes();
      }
    } else {
      const newTab: TabType = 'random';
      setActiveTab(newTab);
      setCurrentMood(null);
      setFilterState({ type: newTab, value: null });

      // Save tab to localStorage
      localStorage.setItem('activeTab', newTab);

      // Use cached random quotes if available
      if (randomQuotesCache.length > 0) {
        // Filter to only show 'quote' type
        const filteredQuotes = filterQuotesByType(randomQuotesCache, 'quote');
        setQuotes(filteredQuotes);
        setCurrentIndex(0);
        setHistory([]);
      } else {
        loadQuotes();
      }
    }
  };

  const currentQuote = quotes[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-border-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary no-scroll">
      {/* Header */}
      <div className="pt-safe-area-inset-top px-6 py-4">
        <div className="flex items-center justify-between">
          {/* View Mode Toggle - on the left */}
          <ViewModeToggle
            currentMode={viewMode}
            onToggle={handleViewModeToggle}
          />

          <div></div> {/* Center spacer */}

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle viewMode={viewMode} />

            {/* Add Quote Button */}
            <motion.button
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-white shadow-lg font-bold text-lg
                ${viewMode === 'alternative' ? 'bg-[#B8A9D4]' : 'bg-primary-500'}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddQuoteClick}
              title={isAuthenticated ? "Add new quote" : "Sign in to add quotes"}
            >
              +
            </motion.button>

            {/* User Profile */}
            <Suspense fallback={<div className="w-10 h-10" />}>
              <UserProfile onSignInClick={() => setIsLoginOpen(true)} viewMode={viewMode} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} viewMode={viewMode} />

      {/* Main Content */}
      <div className="flex-1 px-6 py-8 flex items-start justify-center overflow-y-auto">
        {activeTab === 'mood' && !currentMood ? (
          // Show mood grid when in mood tab but no mood selected
          <MoodGrid onSelectMood={handleMoodSelect} />
        ) : currentQuote ? (
          <motion.div
            className={`w-full swipe-container ${
              currentQuote.type === 'paradigm'
                ? 'max-w-sm md:max-w-5xl lg:max-w-6xl xl:max-w-7xl'
                : 'max-w-sm'
            }`}
            drag="x"
            dragDirectionLock={true}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ x: 0, rotate: 0, scale: 1, opacity: 1 }}
          >
            {currentQuote.type === 'paradigm' ? (
              <ParadigmCard
                quote={currentQuote}
                onEditClick={handleEditQuote}
                onDeleteClick={handleDeleteQuote}
                canEdit={
                  isAuthenticated &&
                  (currentQuote.userId === user?.uid ||
                   (currentQuote.userId === 'system' && user?.email?.includes('@gmail.com')))
                }
              />
            ) : (
              <QuoteCard
                quote={currentQuote}
                onAuthorClick={handleAuthorClick}
                onMoodClick={handleMoodClick}
                onEditClick={handleEditQuote}
                onDeleteClick={handleDeleteQuote}
                canEdit={
                  isAuthenticated &&
                  (currentQuote.userId === user?.uid ||
                   (currentQuote.userId === 'system' && user?.email?.includes('@gmail.com')))
                }
                filterInfo={filterState.value ? {
                  type: filterState.type as 'author' | 'mood',
                  value: filterState.value,
                  count: quotes.length,
                  onClear: clearFilter
                } : undefined}
              />
            )}
          </motion.div>
        ) : (
          <div className="text-center">
            <p className="text-border-medium text-lg mb-4">
              {currentMood
                ? `No quotes found for "${currentMood}" mood`
                : activeTab === 'vitality'
                  ? 'No Vitality cards yet. Click + to add one!'
                  : activeTab === 'paradigm'
                    ? 'No Paradigm cards yet. Click + to add one!'
                    : 'No more quotes available'}
            </p>
            {(activeTab === 'random' || activeTab === 'mood') && (
              <motion.button
                className="
                  px-6 py-3 bg-primary-500 text-white rounded-xl font-medium
                "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadQuotes()}
              >
                Reload
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Change Mood Button - Only show in mood tab when mood is selected */}
      {activeTab === 'mood' && currentMood && (
        <div className="px-6 pb-8 flex justify-center">
          <motion.button
            className="
              px-6 py-3 bg-border-divider text-gray-600 rounded-xl font-medium
              border border-border-light
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentMood(null);
              setFilterState({ type: 'random', value: null });
            }}
          >
            Change Mood
          </motion.button>
        </div>
      )}


      {/* Add Quote/Paradigm Modal */}
      <Suspense fallback={null}>
        {activeTab === 'paradigm' ? (
          <AddParadigmModal
            isOpen={isAddQuoteOpen}
            onClose={() => {
              setIsAddQuoteOpen(false);
              setEditingQuote(null);
            }}
            onSave={async (data) => {
              await handleAddParadigm(data);
              setIsAddQuoteOpen(false);
            }}
            editingQuote={editingQuote || undefined}
          />
        ) : (
          <AddQuoteModal
            isOpen={isAddQuoteOpen}
            onClose={() => {
              setIsAddQuoteOpen(false);
              setEditingQuote(null);
            }}
            onSave={handleAddQuote}
            editingQuote={editingQuote || undefined}
            mode={viewMode === 'alternative' ? 'vitality' : 'quote'}
          />
        )}
      </Suspense>

      {/* Login Modal */}
      <Suspense fallback={null}>
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
      </Suspense>
    </div>
  );
};

export default SwipeInterface;