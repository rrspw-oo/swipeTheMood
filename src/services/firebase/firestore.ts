import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import { Quote, MoodType } from '../../types';

const QUOTES_COLLECTION = 'quotes';

// Convert Firestore document to Quote interface
const convertFirestoreToQuote = (doc: DocumentData, id: string): Quote => {
  const data = doc.data();
  return {
    id,
    text: data.text,
    author: data.author || '',
    moods: data.moods || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    userId: data.userId,
    isPublic: data.isPublic || false,
    type: data.type || 'quote',
    theory: data.theory,
    foundations: data.foundations
  };
};

// Get quotes created by the user only
export const getUserQuotes = async (userId: string): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotesQuery = query(
      quotesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(quotesQuery);
    const quotes: Quote[] = [];

    querySnapshot.forEach((doc) => {
      quotes.push(convertFirestoreToQuote(doc, doc.id));
    });

    return quotes;
  } catch (error) {
    console.error('Error fetching user quotes:', error);
    throw error;
  }
};

// Delete quote by ID (user can delete their own quotes or system quotes if authenticated)
export const deleteQuote = async (quoteId: string, userId: string, userEmail?: string): Promise<void> => {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);

    // First verify the quote exists
    const { getDoc } = await import('firebase/firestore');
    const quoteDoc = await getDoc(quoteRef);

    if (!quoteDoc.exists()) {
      throw new Error('Quote not found');
    }

    const quoteData = quoteDoc.data();

    // User can delete if:
    // 1. They own the quote
    // 2. It's a system quote and they're authenticated with Gmail
    const canDelete = quoteData.userId === userId ||
                     (quoteData.userId === 'system' && userEmail && userEmail.includes('@gmail.com'));

    if (!canDelete) {
      throw new Error('You can only delete your own quotes or system quotes (if logged in with Gmail)');
    }

    await deleteDoc(quoteRef);
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
};

// Update quote by ID (user can update their own quotes or system quotes if authenticated)
export const updateQuote = async (
  quoteId: string,
  userId: string,
  updatedData: Partial<Omit<Quote, 'id' | 'createdAt' | 'userId'>>,
  userEmail?: string
): Promise<Quote> => {
  try {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);

    // First verify the quote exists
    const quoteDoc = await getDoc(quoteRef);

    if (!quoteDoc.exists()) {
      throw new Error('Quote not found');
    }

    const quoteData = quoteDoc.data();

    // User can update if:
    // 1. They own the quote
    // 2. It's a system quote and they're authenticated with Gmail
    const canUpdate = quoteData.userId === userId ||
                     (quoteData.userId === 'system' && userEmail && userEmail.includes('@gmail.com'));

    if (!canUpdate) {
      throw new Error('You can only edit your own quotes or system quotes (if logged in with Gmail)');
    }

    const updateData: any = {};
    if (updatedData.text !== undefined) updateData.text = updatedData.text;
    if (updatedData.author !== undefined) updateData.author = updatedData.author;
    if (updatedData.moods !== undefined) updateData.moods = updatedData.moods;
    if (updatedData.isPublic !== undefined) updateData.isPublic = updatedData.isPublic;
    if (updatedData.type !== undefined) updateData.type = updatedData.type;

    // Add paradigm-specific fields if type is paradigm
    if (updatedData.type === 'paradigm') {
      if (updatedData.theory !== undefined) updateData.theory = updatedData.theory;
      if (updatedData.foundations !== undefined) updateData.foundations = updatedData.foundations;
    }

    await updateDoc(quoteRef, updateData);

    // Return the updated quote
    const updatedDoc = await getDoc(quoteRef);
    return convertFirestoreToQuote(updatedDoc, quoteId);
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
};

// Clear all user data
export const clearUserData = async (userId: string): Promise<void> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const userQuotesQuery = query(
      quotesRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(userQuotesQuery);
    const { deleteDoc, doc } = await import('firebase/firestore');

    // Delete all user's quotes
    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, QUOTES_COLLECTION, document.id))
    );

    await Promise.all(deletePromises);

    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

export const getInitialQuotes = async (userId?: string, includePublic = true): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotes: Quote[] = [];

    // First get all quotes and then filter/sort in memory to avoid compound index issues
    const allQuotesQuery = query(quotesRef, limit(100));
    const querySnapshot = await getDocs(allQuotesQuery);

    querySnapshot.forEach((doc) => {
      const quote = convertFirestoreToQuote(doc, doc.id);

      if (userId && includePublic) {
        // Include public quotes and user's own quotes
        if (quote.isPublic || quote.userId === userId) {
          quotes.push(quote);
        }
      } else if (userId) {
        // Include only user's quotes
        if (quote.userId === userId) {
          quotes.push(quote);
        }
      } else {
        // Include only public quotes (for anonymous users)
        if (quote.isPublic) {
          quotes.push(quote);
        }
      }
    });

    // Sort by created date (shuffle will be done in frontend)
    return quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching initial quotes:', error);
    throw error;
  }
};

export const getQuotesByMood = async (mood: MoodType, userId?: string): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotes: Quote[] = [];

    // Get all quotes and filter in memory to avoid compound index issues
    const allQuotesQuery = query(quotesRef, limit(100));
    const querySnapshot = await getDocs(allQuotesQuery);

    querySnapshot.forEach((doc) => {
      const quote = convertFirestoreToQuote(doc, doc.id);

      // Check if quote has the mood and user can access it
      const hasMood = quote.moods.includes(mood);
      const canAccess = quote.isPublic || quote.userId === userId;

      if (hasMood && canAccess) {
        quotes.push(quote);
      }
    });

    // Sort by created date
    return quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching quotes by mood:', error);
    throw error;
  }
};

export const getQuotesByAuthor = async (author: string, userId?: string): Promise<Quote[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotes: Quote[] = [];

    // Get all quotes and filter in memory to avoid compound index issues
    const allQuotesQuery = query(quotesRef, limit(100));
    const querySnapshot = await getDocs(allQuotesQuery);

    querySnapshot.forEach((doc) => {
      const quote = convertFirestoreToQuote(doc, doc.id);

      // Filter by author and visibility
      const matchesAuthor = quote.author?.toLowerCase().includes(author.toLowerCase());
      const canView = quote.isPublic || quote.userId === userId;

      if (matchesAuthor && canView) {
        quotes.push(quote);
      }
    });

    // Sort by created date
    return quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching quotes by author:', error);
    throw error;
  }
};

export const addQuote = async (
  quoteData: Omit<Quote, 'id' | 'createdAt'>,
  userId: string
): Promise<Quote> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);

    const newQuoteData: any = {
      text: quoteData.text,
      author: quoteData.author || '',
      moods: quoteData.moods,
      userId: userId,
      isPublic: quoteData.isPublic || false,
      type: quoteData.type || 'quote',
      createdAt: Timestamp.fromDate(new Date())
    };

    // Add paradigm-specific fields if type is paradigm
    if (quoteData.type === 'paradigm') {
      newQuoteData.theory = quoteData.theory;
      newQuoteData.foundations = quoteData.foundations;
    }

    const docRef = await addDoc(quotesRef, newQuoteData);

    const newQuote: Quote = {
      id: docRef.id,
      text: newQuoteData.text,
      author: newQuoteData.author,
      moods: newQuoteData.moods,
      userId: newQuoteData.userId,
      isPublic: newQuoteData.isPublic,
      type: newQuoteData.type,
      createdAt: newQuoteData.createdAt.toDate(),
      theory: newQuoteData.theory,
      foundations: newQuoteData.foundations
    };

    return newQuote;
  } catch (error) {
    console.error('Error adding quote:', error);
    throw error;
  }
};

// New function to seed initial data
export const seedInitialQuotes = async () => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);

    // Check if we already have quotes
    const existingQuotes = await getDocs(query(quotesRef, limit(1)));
    if (!existingQuotes.empty) {
      console.log('Quotes already exist, skipping seed');
      return;
    }

    // Your existing mock quotes data
    const seedQuotes = [
      {
        text: 'It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent.',
        author: 'Charlie Munger',
        moods: ['excited', 'reflection'],
        isPublic: true
      },
      {
        text: 'The big money is not in the buying and selling, but in the waiting.',
        author: 'Charlie Munger',
        moods: ['not-my-day', 'reflection'],
        isPublic: true
      },
      {
        text: 'Stay hungry, stay foolish.',
        author: 'Steve Jobs',
        moods: ['innovation', 'excited'],
        isPublic: true
      },
      // Add more seed data as needed...
    ];

    for (const quote of seedQuotes) {
      await addDoc(quotesRef, {
        ...quote,
        userId: 'system',
        createdAt: Timestamp.fromDate(new Date())
      });
    }

    console.log('Initial quotes seeded successfully');
  } catch (error) {
    console.error('Error seeding quotes:', error);
  }
};

// Get all unique authors from quotes
export const getAllAuthors = async (userId?: string): Promise<string[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotes: Quote[] = [];

    // Get all quotes
    const allQuotesQuery = query(quotesRef, limit(200));
    const querySnapshot = await getDocs(allQuotesQuery);

    querySnapshot.forEach((doc) => {
      const quote = convertFirestoreToQuote(doc, doc.id);

      // Include public quotes and user's own quotes
      if (userId) {
        if (quote.isPublic || quote.userId === userId) {
          quotes.push(quote);
        }
      } else {
        // Only public quotes for anonymous users
        if (quote.isPublic) {
          quotes.push(quote);
        }
      }
    });

    // Extract unique authors
    const authorsSet = new Set<string>();
    quotes.forEach(quote => {
      if (quote.author && quote.author.trim()) {
        authorsSet.add(quote.author.trim());
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(authorsSet).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
};

// Get all unique tags from quotes (excluding fixed mood tags)
export const getAllTags = async (userId?: string): Promise<string[]> => {
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);
    const quotes: Quote[] = [];

    // Fixed mood tags to exclude
    const fixedMoodTags = ['excited', 'innovation', 'not-my-day', 'reflection'];

    // Get all quotes
    const allQuotesQuery = query(quotesRef, limit(200));
    const querySnapshot = await getDocs(allQuotesQuery);

    querySnapshot.forEach((doc) => {
      const quote = convertFirestoreToQuote(doc, doc.id);

      // Include public quotes and user's own quotes
      if (userId) {
        if (quote.isPublic || quote.userId === userId) {
          quotes.push(quote);
        }
      } else {
        // Only public quotes for anonymous users
        if (quote.isPublic) {
          quotes.push(quote);
        }
      }
    });

    // Extract unique custom tags (excluding fixed mood tags)
    const tagsSet = new Set<string>();
    quotes.forEach(quote => {
      if (quote.moods && Array.isArray(quote.moods)) {
        quote.moods.forEach(mood => {
          const trimmedMood = mood.trim();
          if (trimmedMood && !fixedMoodTags.includes(trimmedMood)) {
            tagsSet.add(trimmedMood);
          }
        });
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};