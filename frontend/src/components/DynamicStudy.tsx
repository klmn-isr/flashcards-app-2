import React, { useState } from 'react';
import { getRandomUnifiedFlashcard, getRandomUnifiedFlashcardByMaxFrequencyOnly } from '../services/unifiedFlashcardService';
import type { UnifiedFlashcard } from '../services/unifiedFlashcardService';
import type { FlashcardQuestion } from '../types/flashcard';
import { generateRandomQuestion } from '../utils/flashcardUtils';
import { FrequencySelector } from './FrequencySelector';

const DynamicStudy: React.FC = () => {
  const [currentFlashcard, setCurrentFlashcard] = useState<UnifiedFlashcard | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<FlashcardQuestion | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [customFrequency, setCustomFrequency] = useState<number | null>(null);
  const [minFrequency, setMinFrequency] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const loadRandomFlashcard = async () => {
    try {
      setLoading(true);
      
      let flashcard: UnifiedFlashcard | null = null;
      
      if (customFrequency !== null) {
        // Use custom frequency (≤) with min frequency
        flashcard = await getRandomUnifiedFlashcard({ 
          maxFrequency: customFrequency,
          minFrequency: minFrequency || undefined
        });
      } else {
        // Use all frequencies with min frequency
        flashcard = await getRandomUnifiedFlashcard({ 
          minFrequency: minFrequency || undefined
        });
      }
      
      if (flashcard) {
        setCurrentFlashcard(flashcard);
        generateQuestionFromFlashcard(flashcard);
        setTotalQuestions(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading random flashcard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionFromFlashcard = (flashcard: UnifiedFlashcard) => {
    // All flashcards are now remote flashcards
    const remoteFlashcard = flashcard.flashcard as any;
    const question = generateRandomQuestion(remoteFlashcard);
    setCurrentQuestion(question);
  };

  const handleNext = async () => {
    setLoadingNext(true);
    try {
      let flashcard: UnifiedFlashcard | null = null;
      
      if (customFrequency !== null) {
        // Use custom frequency (≤) with min frequency
        flashcard = await getRandomUnifiedFlashcard({ 
          maxFrequency: customFrequency,
          minFrequency: minFrequency || undefined
        });
      } else {
        // Use all frequencies with min frequency
        flashcard = await getRandomUnifiedFlashcard({ 
          minFrequency: minFrequency || undefined
        });
      }
      
      if (flashcard) {
        setCurrentFlashcard(flashcard);
        generateQuestionFromFlashcard(flashcard);
        setTotalQuestions(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading next flashcard:', error);
    } finally {
      setLoadingNext(false);
    }
  };

  const handleCustomFrequencyChange = (frequency: number | null) => {
    setCustomFrequency(frequency);
    // Don't reset question counter or reload flashcard on frequency change
  };

  const handleMinFrequencyChange = (minFreq: number | null) => {
    setMinFrequency(minFreq);
  };



  const handleStart = async () => {
    setIsStarted(true);
    await loadRandomFlashcard();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading random flashcard from Firebase...</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Frequency Selector */}
        <FrequencySelector 
          customFrequency={customFrequency}
          onCustomFrequencyChange={handleCustomFrequencyChange}
          onMinFrequencyChange={handleMinFrequencyChange}
        />

        {/* Start Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start Studying
          </button>
        </div>
      </div>
    );
  }

  if (!currentFlashcard || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">No Flashcards Available</h2>
          <p className="text-gray-600 mb-4">
            No flashcards found for the selected frequency range. Please try a different range or initialize the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Frequency Selector */}
      <FrequencySelector 
        customFrequency={customFrequency}
        onCustomFrequencyChange={handleCustomFrequencyChange}
        onMinFrequencyChange={handleMinFrequencyChange}
      />

      {/* Flashcard Component */}
      <div className="mb-6">
        <Flashcard 
          question={currentQuestion} 
          onNext={handleNext}
          loadingNext={loadingNext}
        />
      </div>
    </div>
  );
};

// Import the Flashcard component
import { Flashcard } from './Flashcard';

export default DynamicStudy; 