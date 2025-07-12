import React, { useState } from 'react';

interface FrequencySelectorProps {
  customFrequency: number | null;
  onCustomFrequencyChange: (frequency: number | null) => void;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({ 
  customFrequency,
  onCustomFrequencyChange
}) => {
  const [customInput, setCustomInput] = useState(customFrequency?.toString() || '');

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
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Frequency Range</h3>
      
      {/* Custom Frequency Input */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-gray-700">Custom Frequency (≤):</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.1"
            value={customInput}
            onChange={(e) => handleCustomFrequencyChange(e.target.value)}
            placeholder="Enter frequency (e.g., 5.5)"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

    </div>
  );
};

export default FrequencySelector; 