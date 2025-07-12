import type { Flashcard, QuestionType, FlashcardQuestion } from '../types/flashcard';

export function generateRandomQuestion(flashcard: Flashcard): FlashcardQuestion {
  const questionTypes: QuestionType[] = ['hebrew', 'transcription', 'translation'];
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  let question: string;
  let answer1: string;
  let answer2: string;
  
  switch (randomType) {
    case 'hebrew':
      question = flashcard.hebrew;
      answer1 = flashcard.transcription;
      answer2 = flashcard.translation;
      break;
    case 'transcription':
      question = flashcard.transcription;
      answer1 = flashcard.hebrew;
      answer2 = flashcard.translation;
      break;
    case 'translation':
      question = flashcard.translation;
      answer1 = flashcard.hebrew;
      answer2 = flashcard.transcription;
      break;
  }
  
  return {
    questionType: randomType,
    question,
    answer1,
    answer2,
    frequency: flashcard.frequency,
    hebrew: flashcard.hebrew
  };
}

export function getQuestionTypeLabel(questionType: QuestionType): string {
  switch (questionType) {
    case 'hebrew':
      return 'Иврит';
    case 'transcription':
      return 'Транскрипция';
    case 'translation':
      return 'Перевод';
  }
} 