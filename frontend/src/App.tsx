import { useState, useEffect } from 'react'
import { Flashcard } from './components/Flashcard'
import { loadAllFlashcards } from './data/flashcardLoader'
import { generateRandomQuestion } from './utils/flashcardUtils'
import type { FlashcardQuestion } from './types/flashcard'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import FlashcardInitializer from './components/FlashcardInitializer'
import FlashcardBrowser from './components/FlashcardBrowser'
import './App.css'

function App() {
  const { currentUser, logout } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState<FlashcardQuestion | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [allFlashcards, setAllFlashcards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [currentView, setCurrentView] = useState<'study' | 'browser' | 'initializer'>('study')

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

  // Show authentication if user is not logged in
  if (!currentUser) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Hebrew Flashcards</h1>
        </header>
        
        <main className="app-main">
          {showRegister ? (
            <div>
              <Register />
              <button 
                className="auth-toggle"
                onClick={() => setShowRegister(false)}
              >
                Already have an account? Sign In
              </button>
            </div>
          ) : (
            <div>
              <Login />
              <button 
                className="auth-toggle"
                onClick={() => setShowRegister(true)}
              >
                Need an account? Sign Up
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (isLoading) {
    return <div className="loading">Loading flashcards...</div>;
  }

  if (!currentQuestion) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hebrew Flashcards</h1>
        <div className="stats">
          <span>Card: {totalQuestions}</span>
          <span>Total words: {allFlashcards.length}</span>
          <div className="nav-buttons">
            <button 
              onClick={() => setCurrentView('study')}
              className={currentView === 'study' ? 'active' : ''}
            >
              Study
            </button>
            <button 
              onClick={() => setCurrentView('browser')}
              className={currentView === 'browser' ? 'active' : ''}
            >
              Browse
            </button>
            <button 
              onClick={() => setCurrentView('initializer')}
              className={currentView === 'initializer' ? 'active' : ''}
            >
              Database
            </button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {currentView === 'study' && (
          <Flashcard 
            question={currentQuestion} 
            onNext={handleNext}
          />
        )}
        
        {currentView === 'browser' && (
          <FlashcardBrowser />
        )}
        
        {currentView === 'initializer' && (
          <FlashcardInitializer />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Study Hebrew with flashcards!</p>
      </footer>
    </div>
  )
}

export default App
