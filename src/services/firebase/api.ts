import { Quote, MoodType } from '../../types';
import {
  getInitialQuotes as getFirestoreQuotes,
  getQuotesByMood as getFirestoreQuotesByMood,
  getQuotesByAuthor as getFirestoreQuotesByAuthor,
  addQuote as addFirestoreQuote,
  getUserQuotes as getFirestoreUserQuotes,
  deleteQuote as deleteFirestoreQuote,
  updateQuote as updateFirestoreQuote,
  clearUserData as clearFirestoreUserData,
  getAllAuthors as getFirestoreAllAuthors,
  getAllTags as getFirestoreAllTags
} from './firestore';
import { sortByUsageData, getAuthorRecords, getTagRecords } from '../../utils/recentUsageTracker';

// Mock data for development - Famous thinkers quotes (kept for fallback)
const mockQuotes: Quote[] = [
  // Charlie Munger
  {
    id: '1',
    text: 'It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent.',
    author: 'Charlie Munger',
    moods: ['excited', 'reflection'],
    createdAt: new Date('2024-01-01'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '2',
    text: 'The big money is not in the buying and selling, but in the waiting.',
    author: 'Charlie Munger',
    moods: ['not-my-day', 'reflection'],
    createdAt: new Date('2024-01-02'),
    userId: 'system',
    isPublic: true
  },

  // Steve Jobs
  {
    id: '3',
    text: 'Stay hungry, stay foolish.',
    author: 'Steve Jobs',
    moods: ['innovation', 'excited'],
    createdAt: new Date('2024-01-03'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '4',
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    moods: ['innovation'],
    createdAt: new Date('2024-01-04'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '5',
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: 'Steve Jobs',
    moods: ['reflection', 'not-my-day'],
    createdAt: new Date('2024-01-05'),
    userId: 'system',
    isPublic: true
  },

  // Elon Musk
  {
    id: '6',
    text: 'When something is important enough, you do it even if the odds are not in your favor.',
    author: 'Elon Musk',
    moods: ['not-my-day', 'innovation'],
    createdAt: new Date('2024-01-06'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '7',
    text: 'Failure is an option here. If things are not failing, you are not innovating enough.',
    author: 'Elon Musk',
    moods: ['innovation', 'not-my-day'],
    createdAt: new Date('2024-01-07'),
    userId: 'system',
    isPublic: true
  },

  // Peter Thiel
  {
    id: '8',
    text: 'Monopoly is the condition of every successful business.',
    author: 'Peter Thiel',
    moods: ['innovation', 'excited'],
    createdAt: new Date('2024-01-08'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '9',
    text: 'We wanted flying cars, instead we got 140 characters.',
    author: 'Peter Thiel',
    moods: ['innovation', 'reflection'],
    createdAt: new Date('2024-01-09'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '10',
    text: 'The next Bill Gates will not build an operating system. The next Larry Page or Sergey Brin will not make a search engine.',
    author: 'Peter Thiel',
    moods: ['innovation'],
    createdAt: new Date('2024-01-10'),
    userId: 'system',
    isPublic: true
  },

  // Adam Grant
  {
    id: '11',
    text: 'The greatest originals are the ones who fail the most, because they are the ones who try the most.',
    author: 'Adam Grant',
    moods: ['not-my-day', 'innovation'],
    createdAt: new Date('2024-01-11'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '12',
    text: 'Being original does not require being first. It just means being different and better.',
    author: 'Adam Grant',
    moods: ['innovation', 'excited'],
    createdAt: new Date('2024-01-12'),
    userId: 'system',
    isPublic: true
  },

  // Benjamin Franklin
  {
    id: '13',
    text: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
    moods: ['reflection', 'not-my-day'],
    createdAt: new Date('2024-01-13'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '14',
    text: 'By failing to prepare, you are preparing to fail.',
    author: 'Benjamin Franklin',
    moods: ['excited', 'reflection'],
    createdAt: new Date('2024-01-14'),
    userId: 'system',
    isPublic: true
  },

  // Björn Natthiko Lindeblad
  {
    id: '15',
    text: 'Happiness is not a destination, it is a way of traveling.',
    author: 'Björn Natthiko Lindeblad',
    moods: ['reflection', 'not-my-day'],
    createdAt: new Date('2024-01-15'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '16',
    text: 'The most important thing is not what happens to you, but how you choose to respond.',
    author: 'Björn Natthiko Lindeblad',
    moods: ['not-my-day', 'reflection'],
    createdAt: new Date('2024-01-16'),
    userId: 'system',
    isPublic: true
  },

  // Kevin Kelly
  {
    id: '17',
    text: 'The future is not some place we are going, but one we are creating.',
    author: 'Kevin Kelly',
    moods: ['innovation', 'excited'],
    createdAt: new Date('2024-01-17'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '18',
    text: 'Over the long term, the future is decided by optimists.',
    author: 'Kevin Kelly',
    moods: ['not-my-day', 'reflection'],
    createdAt: new Date('2024-01-18'),
    userId: 'system',
    isPublic: true
  },

  // Humility quotes for "excited" mood
  {
    id: '19',
    text: 'The more you know, the more you realize you know nothing.',
    author: 'Socrates',
    moods: ['excited'],
    createdAt: new Date('2024-01-19'),
    userId: 'system',
    isPublic: true
  },
  {
    id: '20',
    text: 'Confidence is important, but overconfidence is dangerous.',
    author: 'Warren Buffett',
    moods: ['excited'],
    createdAt: new Date('2024-01-20'),
    userId: 'system',
    isPublic: true
  }
];

// API functions with Firestore integration and fallback
export const getInitialQuotes = async (userId?: string, includePublic = true): Promise<Quote[]> => {
  try {
    // Try to get quotes from Firestore
    const quotes = await getFirestoreQuotes(userId, includePublic);

    // If Firestore returns empty array, use mock data as fallback
    if (quotes.length === 0) {
      console.warn('Firestore returned no quotes, using mock data');
      return mockQuotes;
    }

    return quotes;
  } catch (error) {
    console.warn('Failed to fetch from Firestore, falling back to mock data:', error);
    // Fallback to mock data if Firestore is not configured
    return mockQuotes;
  }
};

export const getQuotesByMood = async (mood: MoodType, userId?: string): Promise<Quote[]> => {
  try {
    const quotes = await getFirestoreQuotesByMood(mood, userId);

    // If Firestore returns empty array, use mock data as fallback
    if (quotes.length === 0) {
      console.warn('Firestore returned no quotes for mood, using mock data');
      return mockQuotes.filter(quote => quote.moods.includes(mood));
    }

    return quotes;
  } catch (error) {
    console.warn('Failed to fetch mood quotes from Firestore, falling back to mock data:', error);
    return mockQuotes.filter(quote => quote.moods.includes(mood));
  }
};

export const getQuotesByAuthor = async (author: string, userId?: string): Promise<Quote[]> => {
  try {
    return await getFirestoreQuotesByAuthor(author, userId);
  } catch (error) {
    console.warn('Failed to fetch author quotes from Firestore, falling back to mock data:', error);
    return mockQuotes.filter(quote =>
      quote.author?.toLowerCase().includes(author.toLowerCase())
    );
  }
};

export const addQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> => {
  if (!quoteData.userId) {
    throw new Error('User must be authenticated to add quotes');
  }

  try {
    return await addFirestoreQuote(quoteData, quoteData.userId);
  } catch (error) {
    console.warn('Failed to add quote to Firestore, falling back to mock:', error);
    // Fallback to mock data if Firestore is not configured
    const newQuote: Quote = {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...quoteData
    };

    mockQuotes.push(newQuote);
    return newQuote;
  }
};

export const getUserQuotes = async (userId: string): Promise<Quote[]> => {
  try {
    return await getFirestoreUserQuotes(userId);
  } catch (error) {
    console.warn('Failed to fetch user quotes from Firestore, falling back to mock data:', error);
    return mockQuotes.filter(quote => quote.userId === userId);
  }
};

export const deleteQuote = async (quoteId: string, userId: string, userEmail?: string): Promise<void> => {
  try {
    return await deleteFirestoreQuote(quoteId, userId, userEmail);
  } catch (error) {
    console.warn('Failed to delete quote from Firestore:', error);
    throw error;
  }
};

export const updateQuote = async (
  quoteId: string,
  userId: string,
  updatedData: Partial<Omit<Quote, 'id' | 'createdAt' | 'userId'>>,
  userEmail?: string
): Promise<Quote> => {
  try {
    return await updateFirestoreQuote(quoteId, userId, updatedData, userEmail);
  } catch (error) {
    console.warn('Failed to update quote in Firestore:', error);
    throw error;
  }
};

export const clearUserData = async (userId: string): Promise<void> => {
  try {
    return await clearFirestoreUserData(userId);
  } catch (error) {
    console.warn('Failed to clear user data from Firestore:', error);
    throw error;
  }
};

export const getAllAuthors = async (userId?: string): Promise<string[]> => {
  try {
    const authors = await getFirestoreAllAuthors(userId);

    // If Firestore returns empty array, use mock data as fallback
    if (authors.length === 0) {
      console.warn('Firestore returned no authors, using mock data');
      const authorsSet = new Set<string>();
      mockQuotes.forEach(quote => {
        if (quote.author && quote.author.trim()) {
          authorsSet.add(quote.author.trim());
        }
      });
      const mockAuthors = Array.from(authorsSet).sort((a, b) => a.localeCompare(b));

      // Sort by recent usage
      const authorRecords = getAuthorRecords();
      return sortByUsageData(mockAuthors, authorRecords);
    }

    // Sort by recent usage
    const authorRecords = getAuthorRecords();
    return sortByUsageData(authors, authorRecords);
  } catch (error) {
    console.warn('Failed to get authors from Firestore, using mock data:', error);
    // Fallback: extract authors from mock data
    const authorsSet = new Set<string>();
    mockQuotes.forEach(quote => {
      if (quote.author && quote.author.trim()) {
        authorsSet.add(quote.author.trim());
      }
    });
    const mockAuthors = Array.from(authorsSet).sort((a, b) => a.localeCompare(b));

    // Sort by recent usage
    const authorRecords = getAuthorRecords();
    return sortByUsageData(mockAuthors, authorRecords);
  }
};

export const getAllTags = async (userId?: string): Promise<string[]> => {
  try {
    const tags = await getFirestoreAllTags(userId);

    // If Firestore returns empty array, use mock data as fallback
    if (tags.length === 0) {
      console.warn('Firestore returned no tags, using mock data');
      const fixedMoodTags = ['excited', 'innovation', 'not-my-day', 'reflection'];
      const tagsSet = new Set<string>();
      mockQuotes.forEach(quote => {
        if (quote.moods && Array.isArray(quote.moods)) {
          quote.moods.forEach(mood => {
            const trimmedMood = mood.trim();
            if (trimmedMood && !fixedMoodTags.includes(trimmedMood)) {
              tagsSet.add(trimmedMood);
            }
          });
        }
      });
      const mockTags = Array.from(tagsSet).sort((a, b) => a.localeCompare(b));

      // Sort by recent usage
      const tagRecords = getTagRecords();
      return sortByUsageData(mockTags, tagRecords);
    }

    // Sort by recent usage
    const tagRecords = getTagRecords();
    return sortByUsageData(tags, tagRecords);
  } catch (error) {
    console.warn('Failed to get tags from Firestore, using mock data:', error);
    const fixedMoodTags = ['excited', 'innovation', 'not-my-day', 'reflection'];
    const tagsSet = new Set<string>();
    mockQuotes.forEach(quote => {
      if (quote.moods && Array.isArray(quote.moods)) {
        quote.moods.forEach(mood => {
          const trimmedMood = mood.trim();
          if (trimmedMood && !fixedMoodTags.includes(trimmedMood)) {
            tagsSet.add(trimmedMood);
          }
        });
      }
    });
    const mockTags = Array.from(tagsSet).sort((a, b) => a.localeCompare(b));

    // Sort by recent usage
    const tagRecords = getTagRecords();
    return sortByUsageData(mockTags, tagRecords);
  }
};

// Future Firebase implementation will replace these mock functions
/*
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
*/