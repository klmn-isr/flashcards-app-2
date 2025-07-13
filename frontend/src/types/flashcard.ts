export interface Flashcard {
  id: string;
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'particle' | 'interjection';
  gender: 'masculine' | 'feminine' | 'common';
  root: string;
  frequency: number; // a calculated score reflecting frequency, transformed logarithmically
  hebrew: string;
  transcription: string;
  translation: string;
}

export type QuestionType = 'hebrew' | 'transcription' | 'translation';

export interface FlashcardQuestion {
  questionType: QuestionType;
  question: string;
  answer1: string;
  answer2: string;
  frequency: number;
  hebrew: string;
} 