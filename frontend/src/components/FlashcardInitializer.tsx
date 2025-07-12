import React, { useState } from 'react';
import { initializeRemoteFlashcards, getFlashcardStats } from '../services/remoteFlashcardService';

const FlashcardInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    byType: Record<string, number>;
    byGender: Record<string, number>;
  } | null>(null);
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setIsInitializing(true);
    setMessage('Loading all flashcards...');
    
    try {
      // First, load all flashcards to get the count
      const { loadAllFlashcards } = await import('../data/flashcardLoader');
      const allFlashcards = await loadAllFlashcards();
      setMessage(`Found ${allFlashcards.length} flashcards. Starting initialization...`);
      
      await initializeRemoteFlashcards();
      setMessage(`Successfully initialized ${allFlashcards.length} flashcards in Firestore!`);
      await loadStats();
    } catch (error) {
      setMessage(`Error initializing flashcards: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadStats = async () => {
    try {
      const flashcardStats = await getFlashcardStats();
      setStats(flashcardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Flashcard Database</h2>
      
      <div className="mb-6">
        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isInitializing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Remote Flashcards'}
        </button>
        
        {message && (
          <p className={`mt-2 text-sm ${
            message.includes('Error') ? 'text-red-600' : 'text-green-600'
          }`}>
            {message}
          </p>
        )}
      </div>

      {stats && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Database Statistics</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total} flashcards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">By Type</h4>
              <div className="space-y-1">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">By Gender</h4>
              <div className="space-y-1">
                {Object.entries(stats.byGender).map(([gender, count]) => (
                  <div key={gender} className="flex justify-between">
                    <span className="capitalize">{gender}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardInitializer; 