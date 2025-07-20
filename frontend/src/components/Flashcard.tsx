import React, { useState, useEffect } from 'react';
import type { FlashcardQuestion } from '../types/flashcard';
import { doc, updateDoc, getDoc, query, collection, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Flashcard.css';

interface FlashcardProps {
  question: FlashcardQuestion;
  onNext: () => void;
  loadingNext?: boolean;
  flashcardId?: string; // Add flashcard ID for Firestore updates
}

export function Flashcard({ question, onNext, loadingNext = false, flashcardId }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionValue, setQuestionValue] = useState(question.question);
  const [answer1Value, setAnswer1Value] = useState(question.answer1);
  const [answer2Value, setAnswer2Value] = useState(question.answer2);
  const [hasChanges, setHasChanges] = useState(false);

  // Update state when question changes (new flashcard loaded)
  useEffect(() => {
    console.log('Question changed, resetting values:', question.question, question.answer1, question.answer2);
    setQuestionValue(question.question);
    setAnswer1Value(question.answer1);
    setAnswer2Value(question.answer2);
    setHasChanges(false);
  }, [question.question, question.answer1, question.answer2]);

  // Determine which fields are being used as answers based on question type
  const getAnswerFields = () => {
    switch (question.questionType) {
      case 'hebrew':
        return { questionField: 'hebrew', answer1Field: 'transcription', answer2Field: 'translation' };
      case 'transcription':
        return { questionField: 'transcription', answer1Field: 'hebrew', answer2Field: 'translation' };
      case 'translation':
        return { questionField: 'translation', answer1Field: 'hebrew', answer2Field: 'transcription' };
      default:
        return { questionField: 'hebrew', answer1Field: 'transcription', answer2Field: 'translation' };
    }
  };

  const { questionField, answer1Field, answer2Field } = getAnswerFields();

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Question changed from', questionValue, 'to', newValue);
    setQuestionValue(newValue);
    setHasChanges(newValue !== question.question || answer1Value !== question.answer1 || answer2Value !== question.answer2);
  };

  const handleAnswer1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Answer1 changed from', answer1Value, 'to', newValue);
    setAnswer1Value(newValue);
    setHasChanges(questionValue !== question.question || newValue !== question.answer1 || answer2Value !== question.answer2);
  };

  const handleAnswer2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Answer2 changed from', answer2Value, 'to', newValue);
    setAnswer2Value(newValue);
    setHasChanges(questionValue !== question.question || answer1Value !== question.answer1 || newValue !== question.answer2);
  };

  const handleNext = async () => {
    // Update Firestore if there are changes and flashcardId is provided

    console.log('hasChanges:', hasChanges);
    console.log('flashcardId:', flashcardId);

    if (hasChanges && flashcardId) {
      try {
        console.log('Attempting to update flashcard with ID:', flashcardId);
        const flashcardRef = doc(db, 'remoteFlashcards', flashcardId);
        
        const updateData: any = {};
        
        // Only update the fields that are actually being used as answers
        if (questionValue !== question.question) {
          updateData[questionField] = questionValue;
        }
        if (answer1Value !== question.answer1) {
          updateData[answer1Field] = answer1Value;
        }
        if (answer2Value !== question.answer2) {
          updateData[answer2Field] = answer2Value;
        }
        
        if (Object.keys(updateData).length > 0) {
          // Check if document exists before updating
          const docSnap = await getDoc(flashcardRef);
          if (!docSnap.exists()) {
            console.error(`Document ${flashcardId} does not exist in remoteFlashcards collection`);
            console.error('This might be because:');
            console.error('1. The document was deleted');
            console.error('2. The flashcard uses auto-generated ID instead of original ID');
            console.error('3. The ID format is incorrect');
            
            // Try to find the document by Hebrew word as fallback
            console.log('Attempting to find document by Hebrew word...');
            const hebrewQuery = query(
              collection(db, 'remoteFlashcards'),
              where('hebrew', '==', question.hebrew),
              limit(1)
            );
            const hebrewSnapshot = await getDocs(hebrewQuery);
            
            if (!hebrewSnapshot.empty) {
              const foundDoc = hebrewSnapshot.docs[0];
              console.log(`Found document with auto-generated ID: ${foundDoc.id}`);
              console.log('Updating using found document ID...');
              
              // Update using the found document ID
              const foundDocRef = doc(db, 'remoteFlashcards', foundDoc.id);
              await updateDoc(foundDocRef, updateData);
              console.log(`Updated flashcard fields in Firestore using found ID: ${foundDoc.id}`);
            } else {
              console.error('Could not find document by Hebrew word either');
            }
          } else {
            console.log('Update data:', updateData);
            console.log('Document path:', flashcardRef.path);
            
            await updateDoc(flashcardRef, updateData);
            console.log(`Updated flashcard fields in Firestore: ${Object.keys(updateData).join(', ')}`);
          }
        }
      } catch (error) {
        console.error('Error updating flashcard:', error);
        console.error('Flashcard ID:', flashcardId);
        console.error('Document path:', `remoteFlashcards/${flashcardId}`);
      }
    }

    setShowAnswer(false);
    setHasChanges(false);
    onNext();
  };

  return (
    <div className="flashcard">
      <div className="flashcard-header">
        <span className="question-type">Частота: {loadingNext ? '...' : question.frequency.toFixed(2)}</span>
      </div>
                 
      {/* Reverso Context Link */}
      <div className="flashcard-context-link">
        <a 
          href={`https://context.reverso.net/translation/hebrew-russian/${encodeURIComponent(question.hebrew)}`}
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
           
      <div className="flashcard-question">
        <input
          type="text"
          className="question-input"
          value={loadingNext ? '...' : questionValue}
          onChange={handleQuestionChange}
          disabled={loadingNext}
          placeholder="Question"
        />
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
          <div className="answers-container">
            <input
              type="text"
              className="answer-input"
              value={loadingNext ? '...' : answer1Value}
              onChange={handleAnswer1Change}
              disabled={loadingNext}
              placeholder={`Original: ${question.answer1}`}
            />
            <input
              type="text"
              className="answer-input"
              value={loadingNext ? '...' : answer2Value}
              onChange={handleAnswer2Change}
              disabled={loadingNext}
              placeholder={`Original: ${question.answer2}`}
            />
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