
import React from 'react';
import type { Option } from '../types';

interface OptionSelectorProps {
  title: string;
  description: string;
  options: Option[];
  selectedOption: string;
  onSelect: (optionId: string) => void;
  columns?: number;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ title, description, options, selectedOption, onSelect, columns = 2 }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{description}</p>
      <div className={`grid grid-cols-${columns} gap-3`}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${
              selectedOption === option.id
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OptionSelector;
