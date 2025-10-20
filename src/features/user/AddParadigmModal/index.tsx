import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateParadigmData, Foundation, Quote } from '../../../types';
import { getAllTags } from '../../../services/firebase/api';
import { trackTagUsage } from '../../../utils/recentUsageTracker';
import { useAuth } from '../../../contexts/AuthContext';

interface AddParadigmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateParadigmData) => Promise<void>;
  editingQuote?: Quote;
}

const AddParadigmModal: React.FC<AddParadigmModalProps> = ({ isOpen, onClose, onSave, editingQuote }) => {
  const { user } = useAuth();
  const [theory, setTheory] = useState('');
  const [description, setDescription] = useState('');
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFoundations, setExpandedFoundations] = useState<Set<string>>(new Set());

  // Tags system
  const [tags, setTags] = useState<string[]>([]); // All available tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Quick select tags
  const [customTags, setCustomTags] = useState<string[]>([]); // Manually input tags
  const [tagInput, setTagInput] = useState('');

  // Responsive tag display
  const [displayLimit, setDisplayLimit] = useState(11);

  // Load tags when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadTags = async () => {
        try {
          const tagsList = await getAllTags(user?.uid);
          console.log('Loaded tags:', tagsList);
          setTags(tagsList);
        } catch (error) {
          console.error('Error loading tags:', error);
        }
      };
      loadTags();
    }
  }, [isOpen, user?.uid]);

  // Responsive tag display limit
  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth < 768) {
        setDisplayLimit(5); // Mobile
      } else if (window.innerWidth < 1024) {
        setDisplayLimit(7); // Tablet
      } else {
        setDisplayLimit(11); // Desktop
      }
    };

    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  // Initialize form with editing quote data
  useEffect(() => {
    if (isOpen) {
      if (editingQuote && editingQuote.type === 'paradigm') {
        // Load existing paradigm data for editing
        setTheory(editingQuote.theory || '');
        setDescription(editingQuote.foundations?.[0]?.description || '');
        setFoundations(editingQuote.foundations || []);
        setIsPublic(editingQuote.isPublic || false);

        // Separate tags into selectedTags and customTags
        const quoteTags = editingQuote.moods || [];
        // Assume tags that exist in the tags list are from Quick select
        const selected = quoteTags.filter(tag => tags.includes(tag));
        const custom = quoteTags.filter(tag => !tags.includes(tag));
        setSelectedTags(selected);
        setCustomTags(custom);

        // Expand all foundations when editing
        const allIds = new Set((editingQuote.foundations || []).map(f => f.id));
        setExpandedFoundations(allIds);
      } else {
        // Reset form for new paradigm
        setTheory('');
        setDescription('');
        setFoundations([]);
        setIsPublic(false);
        setSelectedTags([]);
        setCustomTags([]);
        setExpandedFoundations(new Set());
      }
      setErrors([]);
      setTagInput('');
    }
  }, [isOpen, editingQuote, tags]);

  const handleAddFoundation = () => {
    const newFoundation: Foundation = {
      id: Date.now().toString(),
      code: '',
      title: '',
      description: '',
      examples: []
    };
    setFoundations([...foundations, newFoundation]);
    setExpandedFoundations(prev => new Set(prev).add(newFoundation.id));
  };

  const handleRemoveFoundation = (id: string) => {
    setFoundations(foundations.filter(f => f.id !== id));
    setExpandedFoundations(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleUpdateFoundation = (id: string, field: keyof Foundation, value: string) => {
    setFoundations(foundations.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleAddExample = (foundationId: string) => {
    setFoundations(foundations.map(f =>
      f.id === foundationId
        ? { ...f, examples: [...f.examples, ''] }
        : f
    ));
  };

  const handleUpdateExample = (foundationId: string, exampleIndex: number, value: string) => {
    setFoundations(foundations.map(f =>
      f.id === foundationId
        ? {
            ...f,
            examples: f.examples.map((ex, idx) => idx === exampleIndex ? value : ex)
          }
        : f
    ));
  };

  const handleRemoveExample = (foundationId: string, exampleIndex: number) => {
    setFoundations(foundations.map(f =>
      f.id === foundationId
        ? { ...f, examples: f.examples.filter((_, idx) => idx !== exampleIndex) }
        : f
    ));
  };

  // Tags handling functions
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove from selected
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      // Add to selected
      setSelectedTags([...selectedTags, tag]);
      trackTagUsage(tag);
    }
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!customTags.includes(newTag) && !selectedTags.includes(newTag)) {
        setCustomTags([...customTags, newTag]);
        trackTagUsage(newTag);
      }
      setTagInput('');
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const toggleFoundation = (id: string) => {
    setExpandedFoundations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!theory.trim()) {
      validationErrors.push('Theory name cannot be empty');
    }

    if (theory.length > 200) {
      validationErrors.push('Theory name cannot exceed 200 characters');
    }

    if (foundations.length === 0) {
      validationErrors.push('Please add at least one foundation');
    }

    foundations.forEach((f, index) => {
      if (!f.title.trim()) {
        validationErrors.push(`Foundation ${index + 1}: Title cannot be empty`);
      }
    });

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
      // Auto-generate code based on index and update first foundation's description
      const updatedFoundations = foundations.map((f, index) => ({
        ...f,
        code: (index + 1).toString(),
        description: index === 0 ? description : ''
      }));

      // Combine selectedTags and customTags for moods
      const allTags = [...selectedTags, ...customTags];

      // Track all tags
      allTags.forEach(tag => {
        if (tag && tag.trim()) {
          trackTagUsage(tag.trim());
        }
      });

      await onSave({
        theory,
        description,
        moods: allTags,
        foundations: updatedFoundations,
        isPublic,
        type: 'paradigm'
      });

      // Reset form state
      setTheory('');
      setFoundations([]);
      setIsPublic(false);
      // Don't call onClose here, let parent handle it
    } catch (error) {
      setErrors(['Error saving paradigm, please try again later']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTheory('');
      setFoundations([]);
      setIsPublic(false);
      setErrors([]);
      onClose();
    }
  };

  // 禁用背景滾動
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // 滾動到頂部並固定 body
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      return () => {
        // 恢復滾動
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        document.body.style.height = '';
        window.scrollTo(scrollX, scrollY);
      };
    }
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0 bg-background-primary rounded-t-3xl
              shadow-2xl z-[10000] max-h-[90vh] overflow-y-auto custom-scrollbar
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
                  {editingQuote ? 'Edit Paradigm' : 'Add Paradigm'}
                </h2>
                <p className="text-sm text-border-medium">
                  {editingQuote ? 'Update your theoretical framework' : 'Create a theoretical framework with foundations'}
                </p>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl max-h-32 overflow-y-auto">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Theory Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theory Name *
                </label>
                <input
                  type="text"
                  className="
                    w-full px-4 py-3 border border-border-light rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#B8A9D4]
                    focus:border-transparent
                  "
                  placeholder="Enter theory name..."
                  value={theory}
                  onChange={(e) => setTheory(e.target.value)}
                  maxLength={200}
                />
                <div className="text-xs text-border-medium mt-1 text-right">
                  {theory.length}/200 characters
                </div>
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="
                    w-full px-4 py-3 border border-border-light rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#B8A9D4]
                    focus:border-transparent resize-none
                  "
                  rows={3}
                  placeholder="Enter theory description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="text-xs text-border-medium mt-1">
                  This will appear below the theory name on the card
                </div>
              </div>

              {/* Tags Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tags
                </label>
                <div>
                  {/* Tag Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      className="
                        w-full px-4 py-3 border border-border-light rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-[#B8A9D4]
                        focus:border-transparent text-gray-700
                      "
                      placeholder="Type a tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                    />
                  </div>

                  {/* Tag Quick Select */}
                  {tags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-border-medium mb-2">Quick select:</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, displayLimit).map((tag) => (
                          <motion.button
                            key={tag}
                            type="button"
                            className={`
                              px-3 py-1.5 rounded-full text-xs font-medium
                              transition-all border
                              ${selectedTags.includes(tag)
                                ? 'bg-[#B8A9D4] text-white border-[#B8A9D4]'
                                : 'bg-background-card text-gray-600 border-border-light hover:border-[#B8A9D4] hover:bg-purple-50'
                              }
                            `}
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

                  {/* Display Custom Tags Only */}
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customTags.map((tag, index) => (
                        <motion.div
                          key={index}
                          className="
                            px-3 py-1.5 rounded-full text-xs font-medium
                            bg-[#B8A9D4] text-white border border-[#B8A9D4]
                            flex items-center gap-2
                          "
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTag(tag)}
                            className="hover:text-red-200 transition-colors"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Foundations List */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Foundations *
                  </label>
                  <motion.button
                    type="button"
                    className="
                      px-3 py-1.5 bg-[#B8A9D4] text-white rounded-lg text-sm font-medium
                    "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddFoundation}
                  >
                    Add Foundation
                  </motion.button>
                </div>

                {/* Foundations */}
                <div className="space-y-4">
                  {foundations.map((foundation, index) => {
                    const isExpanded = expandedFoundations.has(foundation.id);

                    return (
                      <motion.div
                        key={foundation.id}
                        className="border border-border-light rounded-xl p-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Foundation Header */}
                        <div className="flex justify-between items-start mb-3">
                          <button
                            type="button"
                            className="flex items-center gap-2 text-left flex-1"
                            onClick={() => toggleFoundation(foundation.id)}
                          >
                            <span className="text-lg">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className="font-medium text-gray-800">
                              Foundation {index + 1}
                              {foundation.code && `: ${foundation.code}`}
                            </span>
                          </button>
                          <motion.button
                            type="button"
                            className="text-red-500 hover:text-red-700 text-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveFoundation(foundation.id)}
                          >
                            Remove
                          </motion.button>
                        </div>

                        {/* Foundation Details - Collapsible */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-3"
                            >
                              {/* Title */}
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  className="
                                    w-full px-3 py-2 border border-border-light rounded-lg text-sm
                                    focus:outline-none focus:ring-2 focus:ring-[#B8A9D4]
                                  "
                                  placeholder="Foundation title"
                                  value={foundation.title}
                                  onChange={(e) => handleUpdateFoundation(foundation.id, 'title', e.target.value)}
                                />
                              </div>

                              {/* Examples */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-xs text-gray-600">
                                    Examples (Optional)
                                  </label>
                                  <motion.button
                                    type="button"
                                    className="text-xs text-[#B8A9D4] hover:underline"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddExample(foundation.id)}
                                  >
                                    + Add Example
                                  </motion.button>
                                </div>

                                <div className="space-y-2">
                                  {foundation.examples.map((example, exIndex) => (
                                    <div key={exIndex} className="flex gap-2">
                                      <input
                                        type="text"
                                        className="
                                          flex-1 px-3 py-2 border border-border-light rounded-lg text-sm
                                          focus:outline-none focus:ring-2 focus:ring-[#B8A9D4]
                                        "
                                        placeholder={`Example ${exIndex + 1}`}
                                        value={example}
                                        onChange={(e) => handleUpdateExample(foundation.id, exIndex, e.target.value)}
                                      />
                                      <motion.button
                                        type="button"
                                        className="text-red-500 hover:text-red-700 text-sm px-2"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemoveExample(foundation.id, exIndex)}
                                      >
                                        ×
                                      </motion.button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {foundations.length === 0 && (
                    <p className="text-sm text-border-medium text-center py-4">
                      No foundations added yet. Click "Add Foundation" to start.
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-background-secondary rounded-xl border border-border-light">
                  <div>
                    <p className="font-medium text-gray-800">Public Share</p>
                    <p className="text-xs text-border-medium">
                      Allow other users to see this paradigm
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isPublic ? 'bg-[#B8A9D4]' : 'bg-border-medium'}
                    `}
                    onClick={() => setIsPublic(!isPublic)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                      animate={{
                        x: isPublic ? 26 : 2
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
                    flex-1 py-3 px-6 bg-[#B8A9D4] text-white rounded-xl
                    font-medium disabled:opacity-50
                  "
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingQuote ? 'Update Paradigm' : 'Save Paradigm')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AddParadigmModal;
