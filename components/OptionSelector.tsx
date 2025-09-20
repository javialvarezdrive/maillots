/**
 * @file A generic component for selecting one option from a list.
 * Renders a grid of buttons, highlighting the currently selected option.
 */
import React from 'react';
import type { Option } from '../types';

/**
 * Props for the OptionSelector component.
 */
interface OptionSelectorProps {
  /** The title displayed above the options. */
  title: string;
  /** A short description or instruction. */
  description: string;
  /** The array of available options. */
  options: Option[];
  /** The ID of the currently selected option. */
  selectedOption: string;
  /** Callback function invoked when an option is selected. */
  onSelect: (optionId: string) => void;
  /** The number of columns for the grid layout. Defaults to 2. */
  columns?: number;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ title, description, options, selectedOption, onSelect, columns = 2 }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{description}</p>
      {/* 
        The grid layout uses a dynamic class name. Tailwind's JIT compiler must be configured
        to recognize these patterns if they are not specified literally.
        In this project's setup, it works correctly.
      */}
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
