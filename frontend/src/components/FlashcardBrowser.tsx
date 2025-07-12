import React, { useState, useEffect } from 'react';
import { 
  getFlashcardsByType, 
  getFlashcardsByGender, 
  searchFlashcards,
  getFlashcardStats
} from '../services/remoteFlashcardService';
import { createUserFlashcardFromRemote } from '../services/unifiedFlashcardService';
import type { Flashcard } from '../types/flashcard';
import type { RemoteFlashcard } from '../services/remoteFlashcardService';

const FlashcardBrowser: React.FC = () => {
  const [flashcards, setFlashcards] = useState<RemoteFlashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Flashcard['type'] | ''>('');
  const [selectedGender, setSelectedGender] = useState<Flashcard['gender'] | ''>('');
  const [stats, setStats] = useState<{
    total: number;
    byType: Record<Flashcard['type'], number>;
    byGender: Record<Flashcard['gender'], number>;
  } | null>(null);

  const flashcardTypes: Flashcard['type'][] = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun', 
    'preposition', 'conjunction', 'particle', 'interjection'
  ];

  const genders: Flashcard['gender'][] = ['masculine', 'feminine', 'common'];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadFlashcards();
  }, [selectedType, selectedGender, searchTerm]);

  const loadStats = async () => {
    try {
      const flashcardStats = await getFlashcardStats();
      setStats(flashcardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      let results: RemoteFlashcard[] = [];

      if (searchTerm) {
        results = await searchFlashcards(searchTerm);
      } else if (selectedType) {
        results = await getFlashcardsByType(selectedType);
      } else if (selectedGender) {
        results = await getFlashcardsByGender(selectedGender);
      } else {
        // Load some random flashcards as default
        const { getRandomFlashcards } = await import('../services/remoteFlashcardService');
        results = await getRandomFlashcards(50);
      }

      setFlashcards(results);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToUserDeck = async (flashcardId: string) => {
    try {
      await createUserFlashcardFromRemote(flashcardId);
      alert('Flashcard added to your deck!');
    } catch (error) {
      alert(`Error adding flashcard: ${error}`);
    }
  };

  const clearFilters = () => {
    setSelectedType('');
    setSelectedGender('');
    setSearchTerm('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Flashcard Browser</h2>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Database Overview</h3>
          <p className="text-xl font-bold text-blue-600">{stats.total} flashcards available</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Hebrew, transcription, or translation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as Flashcard['type'] | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {flashcardTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as Flashcard['gender'] | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Results */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {loading ? 'Loading...' : `${flashcards.length} flashcards found`}
        </h3>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <div key={flashcard.id} className="bg-white p-4 rounded-lg shadow-md border">
            <div className="mb-3">
              <div className="text-2xl font-bold text-right mb-2" dir="rtl">
                {flashcard.hebrew}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {flashcard.transcription}
              </div>
              <div className="text-lg font-medium">
                {flashcard.translation}
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {flashcard.type}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {flashcard.gender}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Frequency: {flashcard.frequency.toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToUserDeck(flashcard.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add to Deck
              </button>
            </div>
          </div>
        ))}
      </div>

      {flashcards.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No flashcards found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default FlashcardBrowser; 