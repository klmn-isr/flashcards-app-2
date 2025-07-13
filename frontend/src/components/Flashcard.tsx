import { useState } from 'react';
import type { FlashcardQuestion } from '../types/flashcard';
import './Flashcard.css';

interface FlashcardProps {
  question: FlashcardQuestion;
  onNext: () => void;
  loadingNext?: boolean;
}

export function Flashcard({ question, onNext, loadingNext = false }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<'answer1' | 'answer2'>>(new Set());

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedAnswers(new Set());
    onNext();
  };

  const handleAnswerClick = (answer: 'answer1' | 'answer2') => {
    setSelectedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answer)) {
        newSet.delete(answer);
      } else {
        newSet.add(answer);
      }
      return newSet;
    });
  };

  return (
    <div className="flashcard">
      <div className="flashcard-header">
        <span className="question-type">Частота: {loadingNext ? '...' : question.frequency.toFixed(2)}</span>
      </div>
      
      <div className="flashcard-question">
        <h2>{loadingNext ? '...' : question.question}</h2>
      </div>

      {!showAnswer ? (
        <div className="flashcard-actions">
          <button 
            className="show-answer-btn"
            onClick={handleShowAnswer}
            disabled={loadingNext}
          >
            Показать ответ
          </button>
        </div>
      ) : (
        <div className="flashcard-answers">

          
          {/* Reverso Context Link */}
          <div className="flashcard-context-link">
            <a 
              href={`https://context.reverso.net/translation/hebrew-english/${encodeURIComponent(question.hebrew)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="context-link"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Reverso Context
            </a>
          </div>

          <div className="answers-container">
            <button
              className={`answer-btn ${selectedAnswers.has('answer1') ? 'selected' : ''}`}
              onClick={() => handleAnswerClick('answer1')}
              disabled={loadingNext}
            >
              {loadingNext ? '...' : question.answer1}
            </button>
            <button
              className={`answer-btn ${selectedAnswers.has('answer2') ? 'selected' : ''}`}
              onClick={() => handleAnswerClick('answer2')}
              disabled={loadingNext}
            >
              {loadingNext ? '...' : question.answer2}
            </button>
          </div>

          
          <div className="flashcard-actions">
            <button 
              className="next-btn"
              onClick={handleNext}
              disabled={loadingNext}
            >
              {loadingNext ? '...' : 'Следующая карточка'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 