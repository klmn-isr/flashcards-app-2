import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Flashcard } from '../types/flashcard';

export interface RemoteFlashcard extends Flashcard {
  originalId: string;
  isActive: boolean;
  category?: string;
  tags?: string[];
  random?: number;
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
        originalId: flashcard.id,
        ...flashcard,
        isActive: true,
        category: 'basic',
        tags: [flashcard.type, flashcard.gender]
      };
      
      // Use the original flashcard ID as the document ID
      const docRef = doc(flashcardsRef, flashcard.id);
      writeBatchInstance.set(docRef, remoteFlashcard);
    });
    
    await writeBatchInstance.commit();
    console.log(`Added batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allFlashcards.length / batchSize)}`);
  }
  
  console.log('Remote flashcards initialized successfully');
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
  
  // Filter out learned flashcards - only get unlearned ones
  q = query(q, where('learned', '!=', true));
  
  // Only add frequency filter if maxFrequency is provided (most common case)
  if (filters?.maxFrequency !== undefined) {
    q = query(q, where('frequency', '<=', filters.maxFrequency));
  }

  // Get a small sample for variety while keeping reads low
  const sampleQuery = query(q, orderBy('frequency', 'desc'), limit(1)); // Get 10 documents for variety
  
  const querySnapshot = await getDocs(sampleQuery);
  const allFlashcards = querySnapshot.docs.map(doc => ({
    originalId: doc.id,
    ...doc.data()
  })) as RemoteFlashcard[];
  
  return allFlashcards;
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
  
  // Filter out learned flashcards - only get unlearned ones
  q = query(q, where('learned', '!=', true));
  
  // Only add frequency filter if maxFrequency is provided (most common case)
  if (filters?.maxFrequency !== undefined) {
    // Get random value between min and max frequency
    const minFreq = filters.minFrequency || 0;
    const maxFreq = filters.maxFrequency;
    
    // Bias random towards 1 using square of random value
    const random = Math.pow(Math.random(), 1); // This biases towards 1
    const randomFreq = Number((Math.random() * (maxFreq - minFreq) + minFreq).toFixed(2));
    console.log(randomFreq, random);
    q = query(q, 
      where('frequency', '<=', randomFreq), 
      where('random', '<=', random)
    );
    //q = query(q, where('frequency', '<=', filters.maxFrequency));
  }
  
  //console.log(filters);

  // Get a small sample for variety while keeping reads low
  const sampleQuery = query(q, orderBy('frequency', 'desc'), limit(5)); // Get 10 documents for variety
  
  const querySnapshot = await getDocs(sampleQuery);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  // Return the single document
  const doc = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.docs.length)];

  console.log(`New flashcard: ${doc.id}`);

  return {
    originalId: doc.id,
    ...doc.data()
  } as RemoteFlashcard;
}


// Helper function for custom frequency (≤)
export async function getRandomFlashcardByMaxFrequencyOnly(maxFrequency: number): Promise<RemoteFlashcard | null> {
  return getRandomFlashcard({ maxFrequency });
}

// Get the lowest frequency value from all flashcards
export async function getLowestFrequency(): Promise<number | null> {
  try {
    const q = query(
      collection(db, 'remoteFlashcards'),
      where('isActive', '==', true),
      where('learned', '!=', true), // Filter out learned flashcards
      orderBy('frequency', 'asc'), // ascending order to get lowest first
      limit(1) // only get the first (lowest) document
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return doc.data().frequency as number;
  } catch (error) {
    console.error('Error getting lowest frequency:', error);
    return null;
  }
}

// Get the highest frequency value from all flashcards
export async function getHighestFrequency(): Promise<number | null> {
  try {
    const q = query(
      collection(db, 'remoteFlashcards'),
      where('isActive', '==', true),
      where('learned', '!=', true), // Filter out learned flashcards
      orderBy('frequency', 'desc'), // descending order to get highest first
      limit(1) // only get the first (highest) document
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return doc.data().frequency as number;
  } catch (error) {
    console.error('Error getting highest frequency:', error);
    return null;
  }
} 





// Reset all flashcards (set learned field to false for all flashcards)
export async function resetAllLearnedFlashcards(): Promise<void> {
  try {
    console.log('Starting to reset all flashcards...');
    
    // Get ALL active flashcards (not just learned ones)
    const allFlashcardsQuery = query(
      collection(db, 'remoteFlashcards'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(allFlashcardsQuery);
    
    if (querySnapshot.empty) {
      console.log('No flashcards found to reset');
      return;
    }
    
    console.log(`Found ${querySnapshot.docs.length} flashcards to reset`);
    
    // Update all flashcards in batches
    const batchSize = 500;
    let processedCount = 0;
    let updatedCount = 0;
    
    for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = querySnapshot.docs.slice(i, i + batchSize);
      
      batchDocs.forEach((doc) => {
        batch.update(doc.ref, { learned: false });
        updatedCount++;
      });
      
      await batch.commit();
      processedCount += batchDocs.length;
      console.log(`Reset batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} flashcards`);
    }
    
    console.log(`Completed! Reset ${updatedCount} flashcards (set learned field to false for all flashcards)`);
  } catch (error) {
    console.error('Error resetting flashcards:', error);
    throw error;
  }
}

// Get statistics about learned vs unlearned flashcards
export async function getFlashcardStats(): Promise<{
  total: number;
  learned: number;
  unlearned: number;
  learnedPercentage: number;
}> {
  try {
    // Get total flashcards
    const totalQuery = query(
      collection(db, 'remoteFlashcards'),
      where('isActive', '==', true)
    );
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;

    // Get learned flashcards
    const learnedQuery = query(
      collection(db, 'remoteFlashcards'),
      where('isActive', '==', true),
      where('learned', '==', true)
    );
    const learnedSnapshot = await getDocs(learnedQuery);
    const learned = learnedSnapshot.size;

    // Calculate unlearned
    const unlearned = total - learned;
    const learnedPercentage = total > 0 ? Math.round((learned / total) * 100) : 0;

    return {
      total,
      learned,
      unlearned,
      learnedPercentage
    };
  } catch (error) {
    console.error('Error getting flashcard stats:', error);
    return {
      total: 0,
      learned: 0,
      unlearned: 0,
      learnedPercentage: 0
    };
  }
}

 