import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Flashcard, UserProgress, UserStats } from '../../../shared/src';

// Flashcards collection
export const flashcardsCollection = collection(db, 'flashcards');

// Get all flashcards
export const getFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const querySnapshot = await getDocs(flashcardsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flashcard[];
  } catch (error) {
    console.error('Error getting flashcards:', error);
    return [];
  }
};

// Get flashcards by category
export const getFlashcardsByCategory = async (category: string): Promise<Flashcard[]> => {
  try {
    const q = query(
      flashcardsCollection,
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flashcard[];
  } catch (error) {
    console.error('Error getting flashcards by category:', error);
    return [];
  }
};

// User progress collection
export const userProgressCollection = collection(db, 'userProgress');

// Save user progress
export const saveUserProgress = async (progress: Omit<UserProgress, 'timestamp'>): Promise<void> => {
  try {
    await addDoc(userProgressCollection, {
      ...progress,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

// Get user progress
export const getUserProgress = async (userId: string): Promise<UserProgress[]> => {
  try {
    const q = query(
      userProgressCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as UserProgress[];
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
};

// User stats collection
export const userStatsCollection = collection(db, 'userStats');

// Get or create user stats
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const q = query(
      userStatsCollection,
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create new user stats
      const newStats: Omit<UserStats, 'lastStudied'> = {
        userId,
        totalCards: 0,
        correctCards: 0,
        streak: 0
      };
      const docRef = await addDoc(userStatsCollection, {
        ...newStats,
        lastStudied: Timestamp.now()
      });
      return {
        ...newStats,
        lastStudied: new Date()
      };
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      lastStudied: doc.data().lastStudied.toDate()
    } as UserStats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

// Update user stats
export const updateUserStats = async (userId: string, stats: Partial<UserStats>): Promise<void> => {
  try {
    const q = query(
      userStatsCollection,
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'userStats', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        ...stats,
        lastStudied: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}; 