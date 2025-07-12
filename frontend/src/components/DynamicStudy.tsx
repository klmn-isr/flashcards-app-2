import React, { useState, useEffect } from 'react';
import { getFlashcardsForStudy } from '../services/unifiedFlashcardService';
import type { UnifiedFlashcard } from '../services/unifiedFlashcardService';
import type { FlashcardQuestion } from '../types/flashcard';
import { generateRandomQuestion } from '../utils/flashcardUtils';

const DynamicStudy: React.FC = () => {
  const [flashcards, setFlashcards] = useState<UnifiedFlashcard[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<FlashcardQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [studyStats, setStudyStats] = useState({
    total: 0,
    userFlashcards: 0,
    remoteFlashcards: 0
  });

  useEffect(() => {
    loadStudyFlashcards();
  }, []);

  const loadStudyFlashcards = async () => {
    try {
      setLoading(true);
      const studyFlashcards = await getFlashcardsForStudy(900, true, true);
      setFlashcards(studyFlashcards);
      
      const stats = {
        total: studyFlashcards.length,
        userFlashcards: studyFlashcards.filter(f => f.type === 'user').length,
        remoteFlashcards: studyFlashcards.filter(f => f.type === 'remote').length
      };
      setStudyStats(stats);
      
      if (studyFlashcards.length > 0) {
        generateNewQuestion(studyFlashcards);
      }
    } catch (error) {
      console.error('Error loading study flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuestion = (flashcardList: UnifiedFlashcard[]) => {
    if (flashcardList.length === 0) return;
    
    const randomFlashcard = flashcardList[Math.floor(Math.random() * flashcardList.length)];
    
    // Handle both user and remote flashcards
    if (randomFlashcard.type === 'remote') {
      const remoteFlashcard = randomFlashcard.flashcard as any;
      const question = generateRandomQuestion(remoteFlashcard);
      setCurrentQuestion(question);
    } else {
      // For user flashcards, create a simple question
      const userFlashcard = randomFlashcard.flashcard as any;
      const question: FlashcardQuestion = {
        questionType: 'hebrew',
        question: userFlashcard.front,
        answer1: userFlashcard.back,
        answer2: 'Incorrect answer',
        frequency: 1
      };
      setCurrentQuestion(question);
    }
    
    setTotalQuestions(prev => prev + 1);
  };



  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards from Firebase...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">No Flashcards Available</h2>
          <p className="text-gray-600 mb-4">
            No flashcards found. Please initialize the database or add some flashcards to your deck.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">Generating question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Study Stats */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Study Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Flashcards:</span> {studyStats.total}
          </div>
          <div>
            <span className="font-medium">Your Deck:</span> {studyStats.userFlashcards}
          </div>
          <div>
            <span className="font-medium">Remote Cards:</span> {studyStats.remoteFlashcards}
          </div>
        </div>
        <div className="mt-2">
          <span className="font-medium">Questions Answered:</span> {totalQuestions}
        </div>
      </div>

      {/* Flashcard Component */}
      <div className="mb-6">
        <Flashcard 
          question={currentQuestion} 
          onNext={() => {}}
        />
      </div>
    </div>
  );
};

// Import the Flashcard component
import { Flashcard } from './Flashcard';

export default DynamicStudy; 