import type { Flashcard } from '../types/flashcard';
import { flashcards as mainFlashcards } from './flashcards';

// Load all flashcards dynamically using async imports
export async function loadAllFlashcards(): Promise<Flashcard[]> {
  const allFlashcards: Flashcard[] = [];
  
  // Add main flashcards
  allFlashcards.push(...mainFlashcards);
  
  try {
    // Dynamic import pattern for Vite - finds all flashcards*.json files
    const modules = import.meta.glob('./flashcards*.json');
    
    const promises = Object.keys(modules).map(async (path) => {
      if (path.match(/flashcards\d+-\d+\.json$/)) {
        const module = await modules[path]();
        return (module as { default: Flashcard[] }).default;
      }
      return [];
    });
    
    const results = await Promise.all(promises);
    results.forEach(flashcards => allFlashcards.push(...flashcards));
    
    console.log(`Loaded ${allFlashcards.length} total flashcards`);
    
  } catch (error) {
    console.warn('Error loading additional flashcard files:', error);
  }
  
  return allFlashcards;
} 