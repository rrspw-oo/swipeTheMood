import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, CreateQuoteData } from '../../../types';
import { getUserQuotes, deleteQuote, updateQuote, getInitialQuotes } from '../../../services/firebase/api';
import { useAuth } from '../../../contexts/AuthContext';
import AddQuoteModal from '../AddQuoteModal';

interface UserCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserCardsModal: React.FC<UserCardsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [userQuotes, setUserQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadUserQuotes = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Get user's quotes plus system quotes if they're logged in with Gmail
      const userQuotes = await getUserQuotes(user.uid);

      // If user has Gmail, also fetch system quotes
      if (user.email?.includes('@gmail.com')) {
        const allQuotes = await getInitialQuotes(user.uid, true);

        // Filter to include user's quotes and system quotes
        const quotesToShow = allQuotes.filter(quote =>
          quote.userId === user.uid || quote.userId === 'system'
        );
        setUserQuotes(quotesToShow);
      } else {
        setUserQuotes(userQuotes);
      }
    } catch (error) {
      console.error('Error loading user quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadUserQuotes();
    }
  }, [isOpen, user?.uid]);

  const handleDeleteQuote = async (quoteId: string) => {
    if (!user?.uid) return;

    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await deleteQuote(quoteId, user.uid, user.email);
      setUserQuotes(prev => prev.filter(q => q.id !== quoteId));
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Failed to delete quote. Please try again.');
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditModalOpen(true);
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
      setUserQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
      setIsEditModalOpen(false);
      setEditingQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excited': return 'bg-yellow-100 text-yellow-800';
      case 'innovation': return 'bg-blue-100 text-blue-800';
      case 'not-my-day': return 'bg-red-100 text-red-800';
      case 'reflection': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          className="bg-background-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Quotes</h2>
              <motion.button
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                ×
              </motion.button>
            </div>
            <p className="text-sm text-border-medium mt-2">
              {userQuotes.length} {userQuotes.length === 1 ? 'quote' : 'quotes'}
              {user?.email?.includes('@gmail.com') ? ' (including system quotes you can edit)' : ' created'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : userQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-border-medium text-lg mb-4">No quotes created yet</p>
                <p className="text-sm text-border-medium">
                  Start creating your personal collection of quotes!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userQuotes.map((quote) => (
                  <motion.div
                    key={quote.id}
                    className="bg-background-primary rounded-xl p-4 border border-border-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium leading-relaxed mb-2">
                          "{quote.text}"
                        </p>
                        {quote.author && (
                          <p className="text-border-medium text-sm">
                            — {quote.author}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <motion.button
                          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditQuote(quote)}
                          title="Edit quote"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteQuote(quote.id)}
                          title="Delete quote"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {quote.moods.map((mood) => (
                          <span
                            key={mood}
                            className={`px-2 py-1 text-xs rounded-full font-medium ${getMoodColor(mood)}`}
                          >
                            {mood}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-border-medium">
                        {quote.userId === 'system' && (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            System
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full ${quote.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {quote.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span>
                          {quote.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit Quote Modal */}
        {editingQuote && (
          <AddQuoteModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingQuote(null);
            }}
            onSave={handleUpdateQuote}
            editingQuote={editingQuote}
          />
        )}
      </div>
    </AnimatePresence>
  );
};

export default UserCardsModal;