import { useState, useEffect } from 'react'
import { Flashcard } from './components/Flashcard'
import { loadAllFlashcards } from './data/flashcardLoader'
import { generateRandomQuestion } from './utils/flashcardUtils'
import type { FlashcardQuestion } from './types/flashcard'
import './App.css'

function App() {
  const [currentQuestion, setCurrentQuestion] = useState<FlashcardQuestion | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [allFlashcards, setAllFlashcards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load all flashcards asynchronously
    const loadFlashcards = async () => {
      try {
        const flashcards = await loadAllFlashcards();
        setAllFlashcards(flashcards);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  const generateNewQuestion = () => {
    if (allFlashcards.length === 0) return;
    
    const randomFlashcard = allFlashcards[Math.floor(Math.random() * allFlashcards.length)];
    const question = generateRandomQuestion(randomFlashcard);
    setCurrentQuestion(question);
    setTotalQuestions(prev => prev + 1);
  };

  useEffect(() => {
    if (allFlashcards.length > 0 && !isLoading) {
      generateNewQuestion();
    }
  }, [allFlashcards, isLoading]);

  const handleNext = () => {
    generateNewQuestion();
  }

  if (isLoading) {
    return <div className="loading">Загрузка карточек...</div>;
  }

  if (!currentQuestion) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Иврит Карточки</h1>
        <div className="stats">
          <span>Карточка: {totalQuestions}</span>
          <span>Всего слов: {allFlashcards.length}</span>
        </div>
      </header>
      
      <main className="app-main">
        <Flashcard 
          question={currentQuestion} 
          onNext={handleNext}
        />
      </main>
      
      <footer className="app-footer">
        <p>Изучайте иврит с помощью карточек!</p>
      </footer>
    </div>
  )
}

export default App
