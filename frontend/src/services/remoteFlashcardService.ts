import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Flashcard } from '../types/flashcard';

export interface RemoteFlashcard extends Flashcard {
  id: string;
  isActive: boolean;
  category?: string;
  tags?: string[];
}

// Initialize remote flashcards in Firestore (run once)
export async function initializeRemoteFlashcards(forceReinitialize: boolean = false): Promise<void> {
  const flashcardsRef = collection(db, 'remoteFlashcards');
  
  // Check if already initialized (unless forcing re-initialization)
  if (!forceReinitialize) {
    const existingDocs = await getDocs(query(flashcardsRef, limit(1)));
    if (!existingDocs.empty) {
      console.log('Remote flashcards already initialized');
      return;
    }
  }

  // Import all flashcards using the loader
  const { loadAllFlashcards } = await import('../data/flashcardLoader');
  const allFlashcards = await loadAllFlashcards();
  
  // Add flashcards in batches using batch writes
  const batchSize = 500;
  for (let i = 0; i < allFlashcards.length; i += batchSize) {
    const flashcardBatch = allFlashcards.slice(i, i + batchSize);
    const writeBatchInstance = writeBatch(db);
    
    flashcardBatch.forEach((flashcard) => {
      const remoteFlashcard: RemoteFlashcard = {
        ...flashcard,
        isActive: true,
        category: 'basic',
        tags: [flashcard.type, flashcard.gender]
      };
      
      const docRef = doc(flashcardsRef);
      writeBatchInstance.set(docRef, remoteFlashcard);
    });
    
    await writeBatchInstance.commit();
    console.log(`Added batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allFlashcards.length / batchSize)}`);
  }
  
  console.log('Remote flashcards initialized successfully');
}

// Get flashcards by type
export async function getFlashcardsByType(type: Flashcard['type']): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('type', '==', type),
    where('isActive', '==', true),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
}

// Get flashcards by frequency range
export async function getFlashcardsByFrequency(minFrequency: number, maxFrequency: number): Promise<RemoteFlashcard[]> {
  // Use only one inequality filter to avoid index requirements
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true),
    where('frequency', '<=', maxFrequency), // Use maxFrequency as primary filter
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
}

// Get flashcards by gender
export async function getFlashcardsByGender(gender: Flashcard['gender']): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('gender', '==', gender),
    where('isActive', '==', true),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
}

// Get flashcards by search term
export async function searchFlashcards(searchTerm: string): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  const allFlashcards = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
  
  // Filter by search term (client-side filtering for now)
  const lowerSearchTerm = searchTerm.toLowerCase();
  return allFlashcards.filter(flashcard => 
    flashcard.hebrew.toLowerCase().includes(lowerSearchTerm) ||
    flashcard.translation.toLowerCase().includes(lowerSearchTerm) ||
    flashcard.transcription.toLowerCase().includes(lowerSearchTerm)
  );
}

// Get random flashcards for study (optimized)
export async function getRandomFlashcards(count: number, filters?: {
  type?: Flashcard['type'];
  gender?: Flashcard['gender'];
  minFrequency?: number;
  maxFrequency?: number;
}): Promise<RemoteFlashcard[]> {
  // Use the simplest possible query to avoid index requirements
  let q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true)
  );
  
  // Only add frequency filter if maxFrequency is provided (most common case)
  if (filters?.maxFrequency !== undefined) {
    q = query(q, where('frequency', '<=', filters.maxFrequency));
  }
  
  console.log('q', q);

  // Get a small sample for variety while keeping reads low
  const sampleQuery = query(q, orderBy('frequency', 'desc'), limit(1)); // Get 10 documents for variety
  
  const querySnapshot = await getDocs(sampleQuery);
  const allFlashcards = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
  
  return allFlashcards;
}

// Get flashcard by ID
export async function getFlashcardById(id: string): Promise<RemoteFlashcard | null> {
  const docRef = doc(db, 'remoteFlashcards', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RemoteFlashcard;
  }
  
  return null;
}

// Get flashcards statistics
export async function getFlashcardStats(): Promise<{
  total: number;
  byType: Record<Flashcard['type'], number>;
  byGender: Record<Flashcard['gender'], number>;
}> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  const flashcards = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
  
  const byType: Record<Flashcard['type'], number> = {
    noun: 0, verb: 0, adjective: 0, adverb: 0, pronoun: 0,
    preposition: 0, conjunction: 0, particle: 0, interjection: 0
  };
  
  const byGender: Record<Flashcard['gender'], number> = {
    masculine: 0, feminine: 0, common: 0
  };
  
  flashcards.forEach(flashcard => {
    byType[flashcard.type]++;
    byGender[flashcard.gender]++;
  });
  
  return {
    total: flashcards.length,
    byType,
    byGender
  };
} 

// Get a single random flashcard efficiently
export async function getRandomFlashcard(filters?: {
  type?: Flashcard['type'];
  gender?: Flashcard['gender'];
  minFrequency?: number;
  maxFrequency?: number;
}): Promise<RemoteFlashcard | null> {
  // Use the simplest possible query to avoid index requirements
  let q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true)
  );
  
  // Only add frequency filter if maxFrequency is provided (most common case)
  if (filters?.maxFrequency !== undefined) {
    q = query(q, where('frequency', '<=', filters.maxFrequency));
  }
  
  console.log('q', q);

  // Get a small sample for variety while keeping reads low
  const sampleQuery = query(q, orderBy('frequency', 'desc'), limit(1)); // Get 10 documents for variety
  
  const querySnapshot = await getDocs(sampleQuery);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  // Return the single document
  const doc = querySnapshot.docs[0];
  
  return {
    id: doc.id,
    ...doc.data()
  } as RemoteFlashcard;
}

// Helper functions for frequency-based requests
export async function getRandomFlashcardByMinFrequency(minFrequency: number): Promise<RemoteFlashcard | null> {
  return getRandomFlashcard({ minFrequency });
}

export async function getRandomFlashcardByMaxFrequency(maxFrequency: number): Promise<RemoteFlashcard | null> {
  return getRandomFlashcard({ maxFrequency });
}

export async function getRandomFlashcardByFrequencyRange(minFrequency: number, maxFrequency: number): Promise<RemoteFlashcard | null> {
  return getRandomFlashcard({ minFrequency, maxFrequency });
}

// Get flashcards by minimum frequency (equals or higher)
export async function getFlashcardsByMinFrequency(minFrequency: number): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true),
    where('frequency', '>=', minFrequency),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
}

// Get flashcards by maximum frequency (equals or lower)
export async function getFlashcardsByMaxFrequency(maxFrequency: number): Promise<RemoteFlashcard[]> {
  console.log('getFlashcardsByMaxFrequency', maxFrequency);

  const q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true),
    where('frequency', '<=', maxFrequency),
    limit(1) // Limit to 1 document to minimize reads
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
} 

// Frequency range definitions - updated to match actual database distribution
export const FREQUENCY_RANGES = {
  '0-11': { min: 0, max: 11, label: 'Common (0-11)' },
  '11-12': { min: 11, max: 12, label: 'Medium-High (11-12)' },
  '12-13': { min: 12, max: 13, label: 'High (12-13)' },
  '13-15': { min: 13, max: 15, label: 'Very High (13-15)' },
  '15+': { min: 15, max: 999, label: 'Rare (15+)' }
} as const;

export type FrequencyRange = keyof typeof FREQUENCY_RANGES;

// Helper function for custom frequency (≤)
export async function getRandomFlashcardByMaxFrequencyOnly(maxFrequency: number): Promise<RemoteFlashcard | null> {
  return getRandomFlashcard({ maxFrequency });
}

// Helper functions for specific frequency ranges
export async function getRandomFlashcardByRange(range: FrequencyRange): Promise<RemoteFlashcard | null> {
  const { min, max } = FREQUENCY_RANGES[range];
  return getRandomFlashcardByFrequencyRange(min, max);
}

export async function getFlashcardsByRange(range: FrequencyRange): Promise<RemoteFlashcard[]> {
  const { min, max } = FREQUENCY_RANGES[range];
  return getFlashcardsByFrequency(min, max);
} 