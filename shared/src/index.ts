export interface Flashcard {
  id: string;
  hebrew: string;
  transliteration: string;
  english: string;
  category?: string;
  difficulty?: number;
}

export interface FlashcardQuestion {
  id: string;
  hebrew: string;
  transliteration: string;
  english: string;
  questionType: 'hebrew-to-english' | 'english-to-hebrew' | 'transliteration-to-english';
  correctAnswer: string;
  options?: string[];
}

export interface UserProgress {
  userId: string;
  flashcardId: string;
  correct: boolean;
  timestamp: Date;
  timeSpent?: number;
}

export interface UserStats {
  userId: string;
  totalCards: number;
  correctCards: number;
  streak: number;
  lastStudied: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
} 