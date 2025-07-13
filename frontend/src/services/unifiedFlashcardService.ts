import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Flashcard } from '../types/flashcard';
import type { RemoteFlashcard } from './remoteFlashcardService';
import { getRandomFlashcards, getRandomFlashcard, getFlashcardById as getRemoteFlashcardById } from './remoteFlashcardService';

// Import frequency ranges from remote service
import { FREQUENCY_RANGES, type FrequencyRange } from './remoteFlashcardService';

export interface StudySession {
  id?: string;
  userId: string;
  remoteFlashcardIds: string[]; // Only remote flashcards
  startTime: Date;
  endTime?: Date;
  correctAnswers: number;
  totalAnswers: number;
  sessionType: 'remote';
}

export interface UnifiedFlashcard {
  id: string;
  type: 'remote';
  flashcard: RemoteFlashcard;
}

// Create study session
export async function createStudySession(session: Omit<StudySession, 'id' | 'userId' | 'startTime'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'studySessions'), {
    ...session,
    userId: user.uid,
    startTime: new Date()
  });

  return docRef.id;
}

// Get user's study sessions
export async function getUserStudySessions(): Promise<StudySession[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'studySessions'),
    where('userId', '==', user.uid),
    orderBy('startTime', 'desc'),
    limit(1) // Limit to 1 document to minimize reads
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as StudySession[];
}

// Get flashcards for study session (remote only)
export async function getFlashcardsForStudy(
  count: number, 
  includeUser: boolean = false, // Disabled user flashcards
  includeRemote: boolean = true,
  filters?: {
    type?: Flashcard['type'];
    gender?: Flashcard['gender'];
    difficulty?: 'easy' | 'medium' | 'hard';
    minFrequency?: number;
    maxFrequency?: number;
  }
): Promise<UnifiedFlashcard[]> {
  const unified: UnifiedFlashcard[] = [];
  
  // Get remote flashcards only
  if (includeRemote) {
    const remoteFilters = {
      type: filters?.type,
      gender: filters?.gender,
      minFrequency: filters?.minFrequency,
      maxFrequency: filters?.maxFrequency
    };
    
    const remoteFlashcards = await getRandomFlashcards(count, remoteFilters);
    remoteFlashcards.forEach(flashcard => {
      unified.push({
        id: flashcard.id,
        type: 'remote',
        flashcard
      });
    });
  }
  
  // Shuffle and return requested count
  const shuffled = unified.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get a single random flashcard for study (remote only)
export async function getRandomUnifiedFlashcard(filters?: {
  type?: Flashcard['type'];
  gender?: Flashcard['gender'];
  difficulty?: 'easy' | 'medium' | 'hard';
  minFrequency?: number;
  maxFrequency?: number;
}): Promise<UnifiedFlashcard | null> {
  // Get a random remote flashcard with proper frequency filters
  const remoteFilters = {
    type: filters?.type,
    gender: filters?.gender,
    minFrequency: filters?.minFrequency,
    maxFrequency: filters?.maxFrequency
  };
  
  const remoteFlashcard = await getRandomFlashcard(remoteFilters);
  
  if (!remoteFlashcard) {
    return null;
  }
  
  // Return as unified flashcard
  return {
    id: remoteFlashcard.id,
    type: 'remote',
    flashcard: remoteFlashcard
  };
}

// Helper functions for frequency-based unified flashcard requests
export async function getRandomUnifiedFlashcardByMinFrequency(minFrequency: number): Promise<UnifiedFlashcard | null> {
  return getRandomUnifiedFlashcard({ minFrequency });
}

export async function getRandomUnifiedFlashcardByMaxFrequency(maxFrequency: number): Promise<UnifiedFlashcard | null> {
  return getRandomUnifiedFlashcard({ maxFrequency });
}

export async function getRandomUnifiedFlashcardByFrequencyRange(minFrequency: number, maxFrequency: number): Promise<UnifiedFlashcard | null> {
  return getRandomUnifiedFlashcard({ minFrequency, maxFrequency });
}

// Helper function for specific frequency ranges
export async function getRandomUnifiedFlashcardByRange(range: FrequencyRange): Promise<UnifiedFlashcard | null> {
  const { min, max } = FREQUENCY_RANGES[range];
  return getRandomUnifiedFlashcardByFrequencyRange(min, max);
}

// Helper function for custom frequency (≤)
export async function getRandomUnifiedFlashcardByMaxFrequencyOnly(maxFrequency: number): Promise<UnifiedFlashcard | null> {
  return getRandomUnifiedFlashcard({ maxFrequency });
} 