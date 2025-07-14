import React, { useState, useEffect } from 'react';
import { getLowestFrequency, getHighestFrequency } from '../services/remoteFlashcardService';

interface FrequencySelectorProps {
  customFrequency: number | null;
  onCustomFrequencyChange: (frequency: number | null) => void;
  onMinFrequencyChange?: (minFrequency: number | null) => void;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({ 
  customFrequency,
  onCustomFrequencyChange,
  onMinFrequencyChange
}) => {
  const [customInput, setCustomInput] = useState(customFrequency?.toString() || '11.00');
  const [minFrequency, setMinFrequency] = useState<number | null>(null);
  const [maxFrequency, setMaxFrequency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load min/max frequencies and set default frequency when component mounts
  useEffect(() => {
    const loadFrequencies = async () => {
      try {
        setLoading(true);
        const [min, max] = await Promise.all([
          getLowestFrequency(),
          getHighestFrequency()
        ]);
        
        setMinFrequency(min);
        setMaxFrequency(max);
        
        // Pass min frequency to parent
        if (onMinFrequencyChange) {
          onMinFrequencyChange(min);
        }
        
        // Set default frequency if customFrequency is null
        if (customFrequency === null) {
          const defaultFreq = max ? Math.min(max, 11.00) : 11.00;
          onCustomFrequencyChange(defaultFreq);
          setCustomInput(defaultFreq.toString());
        }
      } catch (error) {
        console.error('Error loading frequency range:', error);
        // Fallback to default if loading fails
        if (customFrequency === null) {
          onCustomFrequencyChange(11.00);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFrequencies();
  }, []); // Only run on mount

  const handleCustomFrequencyChange = (value: string) => {
    setCustomInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onCustomFrequencyChange(numValue);
    } else {
      onCustomFrequencyChange(null);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">

      {/* Custom Frequency Input */}
      <div className="mb-0">
        <div className="flex items-center justify-center gap-3">
          {/* Min Frequency Display */}
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {loading ? 'Loading...' : minFrequency !== null ? `Min: ${minFrequency.toFixed(2)}` : 'Min: N/A'}
          </div>
          
          {/* Input Field */}
          <input
            type="number"
            min={minFrequency || 0}
            max={maxFrequency || 999}
            step="0.1"
            value={customInput}
            onChange={(e) => handleCustomFrequencyChange(e.target.value)}
            placeholder="Enter frequency (e.g., 5.5)"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center w-32"
            disabled={loading}
          />
          
          {/* Max Frequency Display */}
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {loading ? 'Loading...' : maxFrequency !== null ? `Max: ${maxFrequency.toFixed(2)}` : 'Max: N/A'}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FrequencySelector; 