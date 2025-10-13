import { seedInitialQuotes } from '../services/firebase/firestore';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await seedInitialQuotes();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Call this function once to seed your database
// initializeDatabase();