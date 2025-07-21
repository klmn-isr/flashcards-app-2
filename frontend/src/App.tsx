import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import DynamicStudy from './components/DynamicStudy'
import { fixFrequency, resetAllLearnedFlashcards } from './services/remoteFlashcardService'
import './App.css'

function App() {
  const { currentUser, logout } = useAuth()
  const [isProcessingFixFrequency, setIsProcessingFixFrequency] = useState(false)
  const [isResettingLearned, setIsResettingLearned] = useState(false)

  const handleFixFrequency = async () => {
    try {
      setIsProcessingFixFrequency(true)
      await fixFrequency()
      //alert('Successfully read 20k words!')
    } catch (error) {
      console.error('Error fixing frequency:', error)
      alert('Error fixing frequency. Check console for details.')
    } finally {
      setIsProcessingFixFrequency(false)
    }
  }

  const handleResetLearned = async () => {
    if (!window.confirm('Are you sure you want to reset ALL flashcards? This will mark ALL cards as unlearned, regardless of their current learned status.')) {
      return
    }

    try {
      setIsResettingLearned(true)
      await resetAllLearnedFlashcards()
      alert('Successfully reset all flashcards!')
    } catch (error) {
      console.error('Error resetting flashcards:', error)
      alert('Error resetting flashcards. Check console for details.')
    } finally {
      setIsResettingLearned(false)
    }
  }

  // Show authentication if user is not logged in
  if (!currentUser) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Hebrew Flashcards</h1>
        </header>
        
        <main className="app-main">
          <div>
            <Login />
            <div className="auth-note">
              <p>Sign up is currently disabled. Please contact the administrator for access.</p>
            </div>
          </div>
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
              onClick={handleFixFrequency} 
              disabled={isProcessingFixFrequency}
              className="random-btn"
            >
              {isProcessingFixFrequency ? 'Processing...' : 'Fix Frequency'}
            </button>
            <button 
              onClick={handleResetLearned}
              disabled={isResettingLearned}
              className="reset-btn"
            >
              {isResettingLearned ? 'Resetting...' : 'Reset All'}
            </button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <DynamicStudy />
      </main>
      
      <footer className="app-footer">
        <p>Study Hebrew with flashcards!</p>
      </footer>
    </div>
  )
}

export default App
