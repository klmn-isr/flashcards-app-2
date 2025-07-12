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
export async function initializeRemoteFlashcards(): Promise<void> {
  const flashcardsRef = collection(db, 'remoteFlashcards');
  
  // Check if already initialized
  const existingDocs = await getDocs(query(flashcardsRef, limit(1)));
  if (!existingDocs.empty) {
    console.log('Remote flashcards already initialized');
    return;
  }

  // Import static data
  const { flashcards } = await import('../data/flashcards');
  
  // Add flashcards in batches using batch writes
  const batchSize = 500;
  for (let i = 0; i < flashcards.length; i += batchSize) {
    const flashcardBatch = flashcards.slice(i, i + batchSize);
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
    console.log(`Added batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(flashcards.length / batchSize)}`);
  }
  
  console.log('Remote flashcards initialized successfully');
}

// Get flashcards by type
export async function getFlashcardsByType(type: Flashcard['type']): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('type', '==', type),
    where('isActive', '==', true),
    orderBy('frequency', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
}

// Get flashcards by frequency range
export async function getFlashcardsByFrequency(minFrequency: number, maxFrequency: number): Promise<RemoteFlashcard[]> {
  const q = query(
    collection(db, 'remoteFlashcards'),
    where('frequency', '>=', minFrequency),
    where('frequency', '<=', maxFrequency),
    where('isActive', '==', true),
    orderBy('frequency', 'desc')
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
    orderBy('frequency', 'desc')
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
    orderBy('frequency', 'desc')
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

// Get random flashcards for study
export async function getRandomFlashcards(count: number, filters?: {
  type?: Flashcard['type'];
  gender?: Flashcard['gender'];
  minFrequency?: number;
  maxFrequency?: number;
}): Promise<RemoteFlashcard[]> {
  let q = query(
    collection(db, 'remoteFlashcards'),
    where('isActive', '==', true)
  );
  
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  
  if (filters?.gender) {
    q = query(q, where('gender', '==', filters.gender));
  }
  
  if (filters?.minFrequency !== undefined) {
    q = query(q, where('frequency', '>=', filters.minFrequency));
  }
  
  if (filters?.maxFrequency !== undefined) {
    q = query(q, where('frequency', '<=', filters.maxFrequency));
  }
  
  const querySnapshot = await getDocs(q);
  const allFlashcards = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
  
  // Shuffle and return requested count
  const shuffled = allFlashcards.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
    where('isActive', '==', true)
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