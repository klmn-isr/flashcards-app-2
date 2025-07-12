import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import FlashcardInitializer from './components/FlashcardInitializer'
import FlashcardBrowser from './components/FlashcardBrowser'
import DynamicStudy from './components/DynamicStudy'
import './App.css'

function App() {
  const { currentUser, logout } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [currentView, setCurrentView] = useState<'study' | 'browser' | 'initializer'>('study')

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



  return (
    <div className="app">
      <header className="app-header">
        <h1>Hebrew Flashcards</h1>
        <div className="stats">
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
          <DynamicStudy />
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
