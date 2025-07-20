import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Flashcard } from '../types/flashcard';
import he_50k from '../data/he_50k.txt?raw';

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
  
  // Only add frequency filter if maxFrequency is provided (most common case)
  if (filters?.maxFrequency !== undefined) {
    // Get random value between min and max frequency
    const minFreq = filters.minFrequency || 0;
    const maxFreq = filters.maxFrequency;
    
    // Bias random towards 1 using square of random value
    const random = Math.pow(Math.random(), 1); // This biases towards 1
    const randomFreq = Number((Math.random() * (maxFreq - minFreq) + minFreq).toFixed(2));
    console.log(randomFreq, random);
    q = query(q, where('frequency', '<=', randomFreq), where('random', '<=', random));
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
  // Get actual frequency from he_50k.txt

  /*
  const realFrequency = await getRealFrequency(doc.data().hebrew);
  if (realFrequency) {
    console.log(`Real frequency for ${doc.data().hebrew}: ${realFrequency}`);
  }
  */

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

// Get real frequency from Firestore words collection
export async function getRealFrequency(hebrew: string): Promise<number | null> {
  try {
    //console.log(`Searching for frequency of: ${hebrew}`);
    
    // Get all documents from the words collection
    const wordsRef = collection(db, 'words');
    const querySnapshot = await getDocs(wordsRef);
    
    if (querySnapshot.empty) {
      console.log('No documents found in words collection');
      return null;
    }
    
    // Search through all documents in the words collection
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.frequencies && typeof data.frequencies === 'object') {
        // Check if the Hebrew word exists in this document's frequencies
        if (hebrew in data.frequencies) {
          const frequency = data.frequencies[hebrew];
          //console.log(`Found frequency for ${hebrew}: ${frequency} in document ${doc.id}`);
          return frequency;
        }
      }
    }
    
    console.log(`No frequency found for: ${hebrew}`);
    return null;
  } catch (error) {
    console.error('Error getting real frequency:', error);
    return null;
  }
}

// Fix frequency values in Firestore by updating with real frequencies
export async function fixFrequency(): Promise<void> {
  try {
    console.log('Starting to fix frequency values...');
    
    // Get all flashcards from Firestore
    const flashcardsRef = collection(db, 'remoteFlashcards');
    const querySnapshot = await getDocs(flashcardsRef);
    
    if (querySnapshot.empty) {
      console.log('No flashcards found in Firestore');
      return;
    }
    
    console.log(`Found ${querySnapshot.docs.length} flashcards to process`);
    
    let processedCount = 0;
    let updatedCount = 0;
    
    // Process flashcards one by one
    for (const doc of querySnapshot.docs) {
      const data = doc.data() as RemoteFlashcard;
      
      // Get real frequency for this Hebrew word
      const realFrequency = await getRealFrequency(data.hebrew);
      
      if (realFrequency !== null && realFrequency !== data.frequency) {
        // Update the document with the real frequency
        await setDoc(doc.ref, { frequency: realFrequency }, { merge: true });
        updatedCount++;
        console.log(`Updated frequency for ${data.hebrew}: ${data.frequency} -> ${realFrequency}`);
      }
      
      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`Processed ${processedCount}/${querySnapshot.docs.length} flashcards`);
      }
    }
    
    console.log(`Completed! Updated ${updatedCount} flashcards with real frequency values out of ${processedCount} total flashcards`);
  } catch (error) {
    console.error('Error fixing frequency values:', error);
    throw error;
  }
}

// Add random field to all flashcards
export async function read20kWords(): Promise<void> {
  try {
    console.log('Starting to read 20k words...');
    const batchSize = 10000;
    for (let i = 0; i < 5; i++) {
      const start = i * batchSize;
      const end = start + batchSize - 1;
      // Split into lines and parse first 20k entries
      const lines = he_50k.split('\n').slice(start, end);
      // Create frequency map
      const frequencyMap: Record<string, number> = {};
      // Parse each line into word and frequency
      lines.forEach(line => {
        //console.log(line);
        let [word, freq] = line.trim().split(' ');
        if (word && freq) {
          let freqInt = parseInt(freq);
          // Trim trailing period from word if present
          word = word.replace(/[0-9]/g, '') // Remove numbers
                    .replace(/[a-zA-Z]/g, '') // Remove English letters                   
                    .replace(/^[.-]|[.-]$/, '') // Remove leading and trailing periods
                    .replace(/[\u0591-\u05C7]/g, '') // Remove nikud
                    .replace(/\u05B8\u05D0/g, 'א')  // Normalize alef
                    .replace(/\u05B5\u05D1/g, 'ב')  // Normalize bet
                    .replace(/\u05B7\u05D2/g, 'ג')  // Normalize gimel
                    .replace(/\u05B8\u05D3/g, 'ד') // Normalize dalet
                    .replace(/\u05B9\u05D4/g, 'ה') // Normalize he
                    .replace(/\u05B9\u05D5/g, 'ו') // Normalize vav
                    .replace(/\u05B9\u05D6/g, 'ז') // Normalize zayin
                    .replace(/\u05B9\u05D7/g, 'ח') // Normalize he
                    .replace(/\u05B9\u05D8/g, 'ט') // Normalize tet
                    .replace(/\u05B9\u05D9/g, 'י') // Normalize yod
                    .replace(/\u05B9\u05DA/g, 'כ') // Normalize kaf
                    .replace(/\u05B9\u05DB/g, 'ל') // Normalize lamed
                    .replace(/\u05B9\u05DC/g, 'מ') // Normalize mem
                    .replace(/\u05B9\u05DD/g, 'ם') // Normalize mem sofit
                    .replace(/\u05B9\u05DE/g, 'נ') // Normalize nun
                    .replace(/\u05B9\u05DF/g, 'ן') // Normalize nun sofit
                    .replace(/\u05B9\u05DE/g, 'ס') // Normalize samekh
                    .replace(/\u05B9\u05DF/g, 'ע') // Normalize ayin
                    .replace(/\u05B9\u05E0/g, 'פ') // Normalize pe
                    .replace(/\u05B9\u05E7/g, 'ף') // Normalize pe sofit
                    .replace(/\u05B9\u05E1/g, 'צ') // Normalize tsadi
                    .replace(/\u05B9\u05E8/g, 'ץ') // Normalize tsadi sofit
                    .replace(/\u05B9\u05E2/g, 'ק') // Normalize qof
                    .replace(/\u05B9\u05E3/g, 'ר') // Normalize resh
                    .replace(/\u05B9\u05E4/g, 'ש') // Normalize shin
                    .replace(/\u05B9\u05E5/g, 'ת') // Normalize tav
                    .replace(/\u05B9\u05E6/g, 'ך') // Normalize kaf
                    
          // Check if word contains Hebrew characters (Unicode range: 0x0590-0x05FF)
          const isHebrew = /[\u0590-\u05FF]/.test(word);
          if (isHebrew) frequencyMap[word] = frequencyMap[word] ? freqInt + frequencyMap[word] : freqInt;
        }
      });

      // Map frequency values to log scale
      Object.keys(frequencyMap).forEach(word => {
        frequencyMap[word] = Number(Math.log(frequencyMap[word]).toFixed(2));
      });
      //console.log(frequencyMap);

      /*
      // Save frequency map to Firestore
      const wordsRef = doc(db, 'words', i.toString());
      await setDoc(wordsRef, { frequencies: frequencyMap });
      console.log('Saved frequency map to Firestore');
      */

    }

    console.log(`Completed! Read 20k words!`);
    //console.log(frequencyMap);
  } catch (error) {
    console.error('Error reading 20k words:', error);
    throw error;
  }
} 