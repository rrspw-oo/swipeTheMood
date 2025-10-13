import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, CreateQuoteData, MoodType } from '../../../types';
import { getAllAuthors, getAllTags } from '../../../services/firebase/api';
import { trackAuthorUsage, trackTagUsage } from '../../../utils/recentUsageTracker';
import { useAuth } from '../../../contexts/AuthContext';

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteData: CreateQuoteData) => Promise<void>;
  editingQuote?: Quote;
  mode?: 'quote' | 'vitality';
}

const moods: { value: MoodType; label: string }[] = [
  { value: 'excited', label: 'Excited' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'not-my-day', label: 'Not My Day' },
  { value: 'reflection', label: 'Reflection' }
];

const AddQuoteModal: React.FC<AddQuoteModalProps> = ({ isOpen, onClose, onSave, editingQuote, mode = 'quote' }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateQuoteData>({
    text: '',
    author: '',
    moods: [],
    isPublic: false,
    type: mode
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);

  // Tags system
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Responsive author display
  const [displayLimit, setDisplayLimit] = useState(11);

  // Author suggestions
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Tag suggestions
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagSuggestionsRef = useRef<HTMLDivElement>(null);

  // Load authors and tags list when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [authorsList, tagsList] = await Promise.all([
            getAllAuthors(user?.uid),
            getAllTags(user?.uid)
          ]);
          console.log('Loaded authors:', authorsList);
          console.log('Loaded tags:', tagsList);
          setAuthors(authorsList);
          setTags(tagsList);
        } catch (error) {
          console.error('Error loading authors and tags:', error);
        }
      };
      loadData();
    }
  }, [isOpen, user?.uid]);

  // Initialize form with editing quote data
  useEffect(() => {
    if (editingQuote) {
      // Prevent editing paradigm type quotes in this modal
      if (editingQuote.type === 'paradigm') {
        return;
      }

      if (mode === 'quote') {
        // Quote mode: separate fixed moods and custom tags
        const fixedMoods = editingQuote.moods.filter(m =>
          ['excited', 'innovation', 'not-my-day', 'reflection'].includes(m)
        );
        const customMoods = editingQuote.moods.filter(m =>
          !['excited', 'innovation', 'not-my-day', 'reflection'].includes(m)
        );

        setFormData({
          text: editingQuote.text,
          author: editingQuote.author || '',
          moods: fixedMoods,
          isPublic: editingQuote.isPublic || false,
          type: (editingQuote.type === 'quote' || editingQuote.type === 'vitality') ? editingQuote.type : mode
        });
        setCustomTags(customMoods);
      } else {
        // Vitality mode: all tags are custom
        setFormData({
          text: editingQuote.text,
          author: editingQuote.author || '',
          moods: [],
          isPublic: editingQuote.isPublic || false,
          type: (editingQuote.type === 'quote' || editingQuote.type === 'vitality') ? editingQuote.type : mode
        });
        setCustomTags(editingQuote.moods as string[]);
      }
    } else {
      setFormData({
        text: '',
        author: '',
        moods: [],
        isPublic: false,
        type: mode
      });
      setCustomTags([]);
    }
    setErrors([]);
    setTagInput('');
    setShowSuggestions(false);
  }, [editingQuote, isOpen, mode]);

  // Responsive author display
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDisplayLimit(5);      // Mobile
      } else if (width < 1024) {
        setDisplayLimit(7);      // Tablet
      } else {
        setDisplayLimit(11);     // Desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close author suggestions
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        authorInputRef.current &&
        !authorInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }

      // Close tag suggestions
      if (
        tagSuggestionsRef.current &&
        !tagSuggestionsRef.current.contains(event.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(event.target as Node)
      ) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.text.trim()) {
      validationErrors.push(mode === 'vitality' ? 'Vitality content cannot be empty' : 'Quote content cannot be empty');
    }

    if (formData.text.length > 500) {
      validationErrors.push('Content cannot exceed 500 characters');
    }

    if (formData.author.length > 100) {
      validationErrors.push('Author name cannot exceed 100 characters');
    }

    // Quote mode: must have at least one fixed mood tag or custom tag
    if (mode === 'quote') {
      if (formData.moods.length === 0 && customTags.length === 0) {
        validationErrors.push('Please select at least one mood tag or add a custom tag');
      }
    } else {
      // Vitality mode: must have at least one custom tag
      if (customTags.length === 0) {
        validationErrors.push('Please add at least one tag');
      }
    }

    return validationErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const submitData = {
        ...formData,
        moods: mode === 'quote' ? [...formData.moods, ...customTags] : customTags,
        type: mode
      };

      await onSave(submitData);

      // Track usage
      if (formData.author && formData.author.trim()) {
        trackAuthorUsage(formData.author.trim());
      }

      // Track all tags (both fixed mood tags and custom tags)
      const allTags = mode === 'quote' ? [...formData.moods, ...customTags] : customTags;
      allTags.forEach(tag => {
        if (tag && tag.trim()) {
          trackTagUsage(tag.trim());
        }
      });

      // Reset form
      setFormData({ text: '', author: '', moods: [], isPublic: false, type: mode });
      setCustomTags([]);
      setTagInput('');
      onClose();
    } catch (error) {
      setErrors([mode === 'vitality' ? 'Error saving vitality, please try again later' : 'Error saving quote, please try again later']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ text: '', author: '', moods: [], isPublic: false, type: mode });
      setCustomTags([]);
      setTagInput('');
      setErrors([]);
      setShowSuggestions(false);
      setShowTagSuggestions(false);
      onClose();
    }
  };

  const handleAuthorClick = (author: string) => {
    setFormData(prev => ({ ...prev, author }));
    setShowSuggestions(false);
    trackAuthorUsage(author);
  };

  const handleTagClick = (tag: string) => {
    if (!customTags.includes(tag)) {
      const updatedTags = [...customTags, tag];
      setCustomTags(updatedTags);
      setFormData(prev => ({ ...prev, moods: updatedTags }));
      trackTagUsage(tag);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Handle fixed mood toggle (Quote mode only)
  const handleMoodToggle = (mood: MoodType) => {
    setFormData(prev => {
      const currentMoods = prev.moods as MoodType[];
      const newMoods = currentMoods.includes(mood)
        ? currentMoods.filter(m => m !== mood)
        : [...currentMoods, mood];
      return { ...prev, moods: newMoods };
    });
  };

  // Author input change with suggestions
  const handleAuthorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, author: value }));

    if (value.trim()) {
      const filtered = authors
        .filter(author => author.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 7); // Show max 7 suggestions
      setFilteredAuthors(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Tag input change with suggestions
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.trim()) {
      const filtered = tags
        .filter(tag =>
          tag.toLowerCase().includes(value.toLowerCase()) &&
          !customTags.includes(tag)
        )
        .slice(0, 7); // Show max 7 suggestions
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Tag input handlers (Vitality mode)
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!customTags.includes(newTag)) {
        const updatedTags = [...customTags, newTag];
        setCustomTags(updatedTags);
        setFormData(prev => ({ ...prev, moods: updatedTags }));
        trackTagUsage(newTag);
      }
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = customTags.filter(t => t !== tag);
    setCustomTags(updatedTags);
    setFormData(prev => ({ ...prev, moods: updatedTags }));
  };

  // Get display authors and tags based on screen size
  const displayedAuthors = authors.slice(0, displayLimit);
  const displayedTags = tags.slice(0, displayLimit);

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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0 bg-background-primary rounded-t-3xl
              shadow-2xl z-50 max-h-[90vh] overflow-y-auto custom-scrollbar
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
                  {editingQuote
                    ? (mode === 'vitality' ? 'Edit Vitality' : 'Edit Quote')
                    : (mode === 'vitality' ? 'Add Vitality' : 'Add Quote')
                  }
                </h2>
                {mode === 'quote' && !editingQuote && (
                  <p className="text-sm text-border-medium">
                    Create your personal wisdom quotes
                  </p>
                )}
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Content Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'vitality' ? 'Vitality Content *' : 'Quote Content *'}
                </label>
                <textarea
                  className="
                    w-full px-4 py-3 border border-border-light rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-transparent resize-none
                  "
                  rows={4}
                  placeholder={mode === 'vitality' ? 'Enter your vitality...' : 'Enter your quote...'}
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  maxLength={500}
                />
                <div className="text-xs text-border-medium mt-1 text-right">
                  {formData.text.length}/500 characters
                </div>
              </div>

              {/* Author Input */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name (Optional)
                </label>
                <input
                  ref={authorInputRef}
                  type="text"
                  className="
                    w-full px-4 py-3 border border-border-light rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-transparent
                  "
                  placeholder="Author name"
                  value={formData.author}
                  onChange={handleAuthorInputChange}
                  maxLength={100}
                />

                {/* Author Suggestions Dropdown */}
                {showSuggestions && filteredAuthors.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="
                      absolute z-10 w-full mt-1 bg-white border border-border-light
                      rounded-xl shadow-lg max-h-48 overflow-y-auto
                    "
                  >
                    {filteredAuthors.map((author, index) => (
                      <button
                        key={index}
                        type="button"
                        className="
                          w-full px-4 py-2 text-left hover:bg-primary-50
                          text-sm text-gray-700 transition-colors
                          first:rounded-t-xl last:rounded-b-xl
                        "
                        onClick={() => handleAuthorClick(author)}
                      >
                        {author}
                      </button>
                    ))}
                  </div>
                )}

                {/* Author Tags (Quick Select) */}
                {displayedAuthors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-border-medium mb-2">Quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {displayedAuthors.map((author) => (
                        <motion.button
                          key={author}
                          type="button"
                          className="
                            px-3 py-1.5 rounded-full text-xs font-medium
                            transition-all border
                            bg-background-card text-gray-600 border-border-light
                            hover:border-primary-300 hover:bg-primary-50
                          "
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAuthorClick(author)}
                        >
                          {author}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {mode === 'vitality' ? 'Tags *' : 'Mood Tags *'}
                </label>

                {mode === 'quote' ? (
                  <>
                    {/* Fixed Mood Tags (Quote Mode) */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {moods.map((mood) => (
                        <motion.button
                          key={mood.value}
                          type="button"
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-medium
                            transition-all border
                            ${(formData.moods as MoodType[]).includes(mood.value)
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-background-card text-gray-600 border-border-light hover:border-primary-300 hover:bg-primary-50'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMoodToggle(mood.value)}
                        >
                          {mood.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom Tags Input (Quote Mode) */}
                    <div className="pt-3 border-t border-border-light">
                      <p className="text-xs text-gray-600 mb-2">Add custom tags:</p>

                      {/* Tag Input with Suggestions */}
                      <div className="relative mb-3">
                        <input
                          ref={tagInputRef}
                          type="text"
                          className="
                            w-full px-4 py-3 border border-border-light rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-primary-500
                            focus:border-transparent text-gray-700
                          "
                          placeholder="Type a tag and press Enter..."
                          value={tagInput}
                          onChange={handleTagInputChange}
                          onKeyPress={handleTagInputKeyPress}
                        />

                        {/* Tag Suggestions Dropdown */}
                        {showTagSuggestions && filteredTags.length > 0 && (
                          <div
                            ref={tagSuggestionsRef}
                            className="
                              absolute z-10 w-full mt-1 bg-white border border-border-light
                              rounded-xl shadow-lg max-h-48 overflow-y-auto
                            "
                          >
                            {filteredTags.map((tag, index) => (
                              <button
                                key={index}
                                type="button"
                                className="
                                  w-full px-4 py-2 text-left hover:bg-primary-50
                                  text-sm text-gray-700 transition-colors
                                  first:rounded-t-xl last:rounded-b-xl
                                "
                                onClick={() => handleTagClick(tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tag Quick Select */}
                      {displayedTags.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-border-medium mb-2">Quick select:</p>
                          <div className="flex flex-wrap gap-2">
                            {displayedTags.map((tag) => (
                              <motion.button
                                key={tag}
                                type="button"
                                className="
                                  px-3 py-1.5 rounded-full text-xs font-medium
                                  transition-all border
                                  bg-background-card text-gray-600 border-border-light
                                  hover:border-primary-300 hover:bg-primary-50
                                "
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTagClick(tag)}
                              >
                                {tag}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Custom Tags */}
                      {customTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {customTags.map((tag, index) => (
                            <motion.div
                              key={index}
                              className="
                                px-3 py-1.5 rounded-full text-xs font-medium
                                bg-primary-500 text-white border border-primary-500
                                flex items-center gap-2
                              "
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-red-200 transition-colors"
                              >
                                ×
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Custom Tags Input (Vitality Mode) */}
                    <div>
                      {/* Tag Input with Suggestions */}
                      <div className="relative mb-3">
                        <input
                          ref={tagInputRef}
                          type="text"
                          className="
                            w-full px-4 py-3 border border-border-light rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-primary-500
                            focus:border-transparent text-gray-700
                          "
                          placeholder="Type a tag and press Enter..."
                          value={tagInput}
                          onChange={handleTagInputChange}
                          onKeyPress={handleTagInputKeyPress}
                        />

                        {/* Tag Suggestions Dropdown */}
                        {showTagSuggestions && filteredTags.length > 0 && (
                          <div
                            ref={tagSuggestionsRef}
                            className="
                              absolute z-10 w-full mt-1 bg-white border border-border-light
                              rounded-xl shadow-lg max-h-48 overflow-y-auto
                            "
                          >
                            {filteredTags.map((tag, index) => (
                              <button
                                key={index}
                                type="button"
                                className="
                                  w-full px-4 py-2 text-left hover:bg-primary-50
                                  text-sm text-gray-700 transition-colors
                                  first:rounded-t-xl last:rounded-b-xl
                                "
                                onClick={() => handleTagClick(tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tag Quick Select */}
                      {displayedTags.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-border-medium mb-2">Quick select:</p>
                          <div className="flex flex-wrap gap-2">
                            {displayedTags.map((tag) => (
                              <motion.button
                                key={tag}
                                type="button"
                                className="
                                  px-3 py-1.5 rounded-full text-xs font-medium
                                  transition-all border
                                  bg-background-card text-gray-600 border-border-light
                                  hover:border-primary-300 hover:bg-primary-50
                                "
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTagClick(tag)}
                              >
                                {tag}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Custom Tags */}
                      {customTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {customTags.map((tag, index) => (
                            <motion.div
                              key={index}
                              className="
                                px-3 py-1.5 rounded-full text-xs font-medium
                                bg-primary-500 text-white border border-primary-500
                                flex items-center gap-2
                              "
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-red-200 transition-colors"
                              >
                                ×
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Privacy Setting */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-background-secondary rounded-xl border border-border-light">
                  <div>
                    <p className="font-medium text-gray-800">Public Share</p>
                    <p className="text-xs text-border-medium">
                      {mode === 'vitality' ? 'Allow other users to see this vitality' : 'Allow other users to see this quote'}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${formData.isPublic ? 'bg-primary-500' : 'bg-border-medium'}
                    `}
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                      animate={{
                        x: formData.isPublic ? 26 : 2
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  className="
                    flex-1 py-3 px-6 bg-border-divider text-gray-600 rounded-xl
                    font-medium disabled:opacity-50
                  "
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="
                    flex-1 py-3 px-6 bg-primary-500 text-white rounded-xl
                    font-medium disabled:opacity-50
                  "
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (editingQuote
                        ? 'Updating...'
                        : (mode === 'vitality' ? 'Saving...' : 'Saving...'))
                    : (editingQuote
                        ? (mode === 'vitality' ? 'Update Vitality' : 'Update Quote')
                        : (mode === 'vitality' ? 'Save Vitality' : 'Save Quote'))
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddQuoteModal;
