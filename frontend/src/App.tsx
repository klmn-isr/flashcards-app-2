import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import DynamicStudy from './components/DynamicStudy'
import { fixFrequency } from './services/remoteFlashcardService'
import './App.css'

function App() {
  const { currentUser, logout } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [isProcessingFixFrequency, setIsProcessingFixFrequency] = useState(false)

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
              onClick={handleFixFrequency} 
              disabled={isProcessingFixFrequency}
              className="random-btn"
            >
              {isProcessingFixFrequency ? 'Processing...' : 'Fix Frequency'}
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
