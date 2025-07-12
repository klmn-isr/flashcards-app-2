import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Flashcard } from '../types/flashcard';
import type { RemoteFlashcard } from './remoteFlashcardService';
import { getRandomFlashcards, getRandomFlashcard, getFlashcardById as getRemoteFlashcardById } from './remoteFlashcardService';

// Import frequency ranges from remote service
import { FREQUENCY_RANGES, type FrequencyRange } from './remoteFlashcardService';

export interface UserFlashcard {
  id?: string;
  userId: string;
  remoteFlashcardId?: string; // Reference to remote flashcard
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
  tags?: string[];
  notes?: string;
}

export interface StudySession {
  id?: string;
  userId: string;
  flashcardIds: string[];
  remoteFlashcardIds: string[]; // Include remote flashcards
  startTime: Date;
  endTime?: Date;
  correctAnswers: number;
  totalAnswers: number;
  sessionType: 'user' | 'remote' | 'mixed';
}

export interface UnifiedFlashcard {
  id: string;
  type: 'user' | 'remote';
  flashcard: UserFlashcard | RemoteFlashcard;
  progress?: {
    reviewCount: number;
    correctCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed?: Date;
  };
}

// Create a new user flashcard
export async function createUserFlashcard(flashcard: Omit<UserFlashcard, 'id' | 'userId' | 'createdAt' | 'reviewCount' | 'correctCount'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'userFlashcards'), {
    ...flashcard,
    userId: user.uid,
    createdAt: new Date(),
    reviewCount: 0,
    correctCount: 0
  });

  return docRef.id;
}

// Create a user flashcard from a remote flashcard
export async function createUserFlashcardFromRemote(remoteFlashcardId: string, notes?: string): Promise<string> {
  const remoteFlashcard = await getRemoteFlashcardById(remoteFlashcardId);
  if (!remoteFlashcard) throw new Error('Remote flashcard not found');

  return createUserFlashcard({
    remoteFlashcardId,
    front: remoteFlashcard.hebrew,
    back: `${remoteFlashcard.transcription} - ${remoteFlashcard.translation}`,
    difficulty: 'medium',
    tags: [remoteFlashcard.type, remoteFlashcard.gender],
    notes
  });
}

// Get user's flashcards
export async function getUserFlashcards(): Promise<UserFlashcard[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'userFlashcards'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const flashcards = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserFlashcard[];
  
  return flashcards;
}

// Get unified flashcards (user + remote)
export async function getUnifiedFlashcards(limit?: number): Promise<UnifiedFlashcard[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Get user flashcards
  const userFlashcards = await getUserFlashcards();
  
  // Get some remote flashcards
  const remoteFlashcards = await getRandomFlashcards(limit || 50);
  
  const unified: UnifiedFlashcard[] = [];
  
  // Add user flashcards
  userFlashcards.forEach(flashcard => {
    unified.push({
      id: flashcard.id!,
      type: 'user',
      flashcard,
      progress: {
        reviewCount: flashcard.reviewCount,
        correctCount: flashcard.correctCount,
        difficulty: flashcard.difficulty,
        lastReviewed: flashcard.lastReviewed
      }
    });
  });
  
  // Add remote flashcards
  remoteFlashcards.forEach(flashcard => {
    unified.push({
      id: flashcard.id,
      type: 'remote',
      flashcard
    });
  });
  
  return unified;
}

// Update user flashcard progress
export async function updateUserFlashcardProgress(
  flashcardId: string, 
  reviewCount: number, 
  correctCount: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const updateData: any = {
    reviewCount,
    correctCount,
    lastReviewed: new Date()
  };
  
  if (difficulty) {
    updateData.difficulty = difficulty;
  }

  await updateDoc(doc(db, 'userFlashcards', flashcardId), updateData);
  
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
    orderBy('startTime', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as StudySession[];
}

// Delete a user flashcard
export async function deleteUserFlashcard(flashcardId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await deleteDoc(doc(db, 'userFlashcards', flashcardId));
  
}

// Get flashcards for study session
export async function getFlashcardsForStudy(
  count: number, 
  includeUser: boolean = true, 
  includeRemote: boolean = true,
  filters?: {
    type?: Flashcard['type'];
    gender?: Flashcard['gender'];
    difficulty?: 'easy' | 'medium' | 'hard';
  }
): Promise<UnifiedFlashcard[]> {
  const unified: UnifiedFlashcard[] = [];
  
  // Get user flashcards if requested
  if (includeUser) {
    const userFlashcards = await getUserFlashcards();
    const filteredUser = userFlashcards.filter(flashcard => {
      if (filters?.difficulty && flashcard.difficulty !== filters.difficulty) {
        return false;
      }
      return true;
    });
    
    filteredUser.forEach(flashcard => {
      unified.push({
        id: flashcard.id!,
        type: 'user',
        flashcard,
        progress: {
          reviewCount: flashcard.reviewCount,
          correctCount: flashcard.correctCount,
          difficulty: flashcard.difficulty,
          lastReviewed: flashcard.lastReviewed
        }
      });
    });
  }
  
  // Get remote flashcards if requested
  if (includeRemote) {
    const remoteFilters = {
      type: filters?.type,
      gender: filters?.gender
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

// Subscribe to user flashcards changes
export function subscribeToUserFlashcards(callback: (flashcards: UserFlashcard[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'userFlashcards'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const flashcards = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserFlashcard[];
    callback(flashcards);
  });
} 

// Get a single random flashcard for study
export async function getRandomUnifiedFlashcard(filters?: {
  type?: Flashcard['type'];
  gender?: Flashcard['gender'];
  difficulty?: 'easy' | 'medium' | 'hard';
  minFrequency?: number;
  maxFrequency?: number;
}): Promise<UnifiedFlashcard | null> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Get user flashcards
  const userFlashcards = await getUserFlashcards();
  const filteredUser = userFlashcards.filter(flashcard => {
    if (filters?.difficulty && flashcard.difficulty !== filters.difficulty) {
      return false;
    }
    return true;
  });

  // Get a random remote flashcard
  const remoteFilters = {
    type: filters?.type,
    gender: filters?.gender
  };
  
  const remoteFlashcard = await getRandomFlashcard(remoteFilters);
  
  // Combine user and remote flashcards
  const allFlashcards: UnifiedFlashcard[] = [];
  
  // Add user flashcards
  filteredUser.forEach(flashcard => {
    allFlashcards.push({
      id: flashcard.id!,
      type: 'user',
      flashcard,
      progress: {
        reviewCount: flashcard.reviewCount,
        correctCount: flashcard.correctCount,
        difficulty: flashcard.difficulty,
        lastReviewed: flashcard.lastReviewed
      }
    });
  });
  
  // Add remote flashcard if found
  if (remoteFlashcard) {
    allFlashcards.push({
      id: remoteFlashcard.id,
      type: 'remote',
      flashcard: remoteFlashcard
    });
  }
  
  if (allFlashcards.length === 0) {
    return null;
  }
  
  // Return a single random flashcard
  const randomIndex = Math.floor(Math.random() * allFlashcards.length);
  return allFlashcards[randomIndex];
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